import fs from 'node:fs';
import path from 'node:path';
import {chunkWords} from './lib/chunk.mjs';
import {
  ensureDir,
  fail,
  loadEnv,
  parseArgs,
  readJson,
  writeJson,
} from './lib/util.mjs';

loadEnv();

const args = parseArgs(process.argv.slice(2));
const id = args.id ?? '001-silence';
const dir = path.join('content', id);
const scenesFile = path.join(dir, 'scenes.json');
const wordsFile = path.join(dir, 'words.json');
const brollFile = path.join(dir, 'broll.json');
const propsFile = path.join(dir, 'props.json');

if (!fs.existsSync(wordsFile)) {
  fail(`missing ${wordsFile} — run node scripts/tts.mjs --id ${id} first`);
}

const config = readJson(scenesFile);
const wordsRaw = readJson(wordsFile);
const fps = config.fps ?? 30;
const width = config.width ?? 1080;
const height = config.height ?? 1920;
const overlap = config.overlap ?? 14;
const seed = config.seed ?? 7;
const preRoll = 3;
const outro = 30;
const accentColor = config.accent ?? '#FF4D2E';

const toFrame = (ms) => Math.round((ms / 1000) * fps);

const words = wordsRaw.words.map((word) => {
  const startFrame = toFrame(word.startMs);
  const endFrame = Math.max(startFrame + 1, toFrame(word.endMs));
  return {text: word.text, startFrame, endFrame};
});

const groups = [];
let cursor = 0;
for (const scene of config.scenes) {
  const count = scene.text.trim().split(/\s+/).length;
  const group = words.slice(cursor, cursor + count);
  if (group.length !== count) {
    fail(
      `word split mismatch at scene ${groups.length + 1}: expected ${count}, got ${group.length}`,
    );
  }
  groups.push(group);
  cursor += count;
}

if (cursor !== words.length) {
  fail(`${words.length - cursor} timed words not assigned to a scene`);
}

const starts = groups.map((group, index) => {
  if (index === 0) return 0;
  return Math.max(0, group[0].startFrame - preRoll);
});

for (let i = 1; i < starts.length; i++) {
  const min = starts[i - 1] + overlap + 1;
  if (starts[i] < min) starts[i] = min;
}

const durations = starts.map((start, index) => {
  if (index < starts.length - 1) return starts[index + 1] + overlap - start;
  const lastEnd = groups[index][groups[index].length - 1].endFrame;
  return lastEnd + outro - start;
});

for (let i = 0; i < durations.length; i++) {
  if (durations[i] <= overlap) {
    fail(`scene ${i + 1} too short (${durations[i]} frames, overlap ${overlap})`);
  }
}

const normalize = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9'-]/g, '');

const brollManifest = fs.existsSync(brollFile) ? readJson(brollFile) : {};
const brollDir = path.join(dir, 'build', 'broll');
const publicBrollDir = path.join('public', 'content', id, 'broll');
ensureDir(publicBrollDir);

const scenes = config.scenes.map((scene, index) => {
  const sceneId = `s${index + 1}`;
  const source = brollManifest[sceneId];
  let broll = {
    kind: 'none',
    src: null,
    kenBurns: scene.kenBurns ?? 'in',
  };

  if (source?.kind === 'art') {
    broll = {
      kind: 'art',
      src: null,
      kenBurns: scene.kenBurns ?? 'in',
      art: source.art ?? scene.broll ?? null,
    };
  } else if (source?.kind === 'video' && fs.existsSync(path.join(brollDir, `${sceneId}.mp4`))) {
    fs.copyFileSync(
      path.join(brollDir, `${sceneId}.mp4`),
      path.join(publicBrollDir, `${sceneId}.mp4`),
    );
    broll = {
      kind: 'video',
      src: `content/${id}/broll/${sceneId}.mp4`,
      kenBurns: scene.kenBurns ?? 'in',
    };
  }

  return {
    id: sceneId,
    startFrame: starts[index],
    durationInFrames: durations[index],
    text: scene.text,
    broll,
    enter: scene.enter ?? {kind: 'push', dir: 'up'},
    exit:
      index < config.scenes.length - 1
        ? config.scenes[index + 1].enter ?? {kind: 'push', dir: 'up'}
        : {kind: 'push', dir: 'none'},
    accent: scene.accent ?? null,
    invert: Boolean(scene.invert),
  };
});

for (let i = 0; i < scenes.length - 1; i++) {
  const exit = scenes[i].exit;
  const enter = scenes[i + 1].enter;
  if (exit.kind !== enter.kind || exit.dir !== enter.dir) {
    fail(
      `transition mismatch between ${scenes[i].id} and ${scenes[i + 1].id}: exit ${exit.kind}/${exit.dir} vs enter ${enter.kind}/${enter.dir}`,
    );
  }
}

const captions = [];
config.scenes.forEach((scene, index) => {
  const accent = scene.accent ?? null;
  const pages = chunkWords(groups[index], {fps});
  for (const page of pages) {
    const hasAccent =
      accent !== null &&
      page.words.some((word) => normalize(word.text) === normalize(accent));
    captions.push({
      startFrame: page.startFrame,
      endFrame: page.endFrame,
      words: page.words,
      accent: hasAccent ? accent : null,
    });
  }
});

captions.sort((a, b) => a.startFrame - b.startFrame);

let invertAtFrame = null;
config.scenes.forEach((scene, index) => {
  if (!scene.invert || invertAtFrame !== null) return;
  const accent = scene.accent;
  const word = accent
    ? groups[index].find((candidate) => normalize(candidate.text) === normalize(accent))
    : null;
  invertAtFrame = word
    ? Math.max(starts[index], word.startFrame - 2)
    : starts[index] + Math.floor(durations[index] * 0.55);
});

const DEFAULT_GAIN = {
  'whoosh-soft': -16,
  'whoosh-hard': -12,
  'sub-hit': -8,
  'riser-reverse': -13,
  downlifter: -15,
  tick: -16,
  shimmer: -16,
};

const sfx = [];
config.scenes.forEach((scene, index) => {
  const cues = scene.sfx ?? [];
  for (const raw of cues) {
    const cue = typeof raw === 'string' ? {name: raw} : raw;
    const file = path.join('public', 'sfx', `${cue.name}.mp3`);
    if (!fs.existsSync(file)) {
      fail(`missing SFX ${file} — run node scripts/sfx-gen.mjs`);
    }

    let base = starts[index];
    if (cue.at === 'accent') {
      const accent = scene.accent;
      const word = accent
        ? groups[index].find(
            (candidate) => normalize(candidate.text) === normalize(accent),
          )
        : null;
      base = word ? word.startFrame : starts[index] + Math.floor(durations[index] / 2);
    } else if (cue.at === 'mid') {
      base = starts[index] + Math.floor(durations[index] / 2);
    } else if (cue.at === 'end') {
      base = starts[index] + durations[index] - 6;
    }

    const frame = Math.max(
      0,
      Math.min(base + (cue.offsetFrames ?? 0), starts[index] + durations[index] - 1),
    );

    sfx.push({
      name: cue.name,
      frame,
      gainDb: cue.gainDb ?? DEFAULT_GAIN[cue.name] ?? -14,
      pan: cue.pan ?? 0,
    });
  }
});

sfx.sort((a, b) => a.frame - b.frame);

const durationInFrames =
  scenes[scenes.length - 1].startFrame +
  scenes[scenes.length - 1].durationInFrames;

const videoProps = {
  id,
  fps,
  width,
  height,
  durationInFrames,
  accent: accentColor,
  scenes,
  captions,
  invertAtFrame,
  sfx,
};

writeJson(propsFile, videoProps);

const videoScenes = scenes.filter((scene) => scene.broll.kind === 'video').length;
const accentWords = captions.filter((page) => page.accent).length;

console.log(
  `props ok: ${propsFile}\n` +
    `  ${scenes.length} scenes, ${words.length} words, ${captions.length} caption pages (${accentWords} with accent)\n` +
    `  ${videoScenes}/${scenes.length} with b-roll, ${sfx.length} sfx cues, ${(durationInFrames / fps).toFixed(1)} s`,
);
