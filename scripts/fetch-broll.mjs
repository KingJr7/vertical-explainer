import fs from 'node:fs';
import path from 'node:path';
import {
  fail,
  loadEnv,
  parseArgs,
  readJson,
  run,
  ffprobeDuration,
} from './lib/util.mjs';

loadEnv();

const args = parseArgs(process.argv.slice(2));
const id = args.id ?? '001-silence';
const dir = path.join('content', id);

const SEARCH = 'https://api.pexels.com/videos/search';
const apiKey = process.env.PEXELS_API_KEY;

const config = readJson(path.join(dir, 'scenes.json'));
const brollFile = path.join(dir, 'broll.json');
const buildDir = path.join(dir, 'build', 'broll');
const rawDir = path.join(buildDir, 'raw');
fs.mkdirSync(rawDir, {recursive: true});

const seed = config.seed ?? 7;

function hashIndex(value, length) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % length;
}

async function searchVideos(query) {
  const url = `${SEARCH}?query=${encodeURIComponent(
    query,
  )}&orientation=portrait&size=medium&per_page=15`;

  const response = await fetch(url, {
    headers: {Authorization: apiKey},
  });

  if (!response.ok) {
    throw new Error(`Pexels ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }

  const data = await response.json();
  return data.videos ?? [];
}

function pickFile(video) {
  const files = (video.video_files ?? []).filter(
    (file) => file.file_type === 'video/mp4' && file.width >= 720,
  );
  if (files.length === 0) return null;

  const portrait = files.filter((file) => file.height >= 1280);
  const pool = portrait.length > 0 ? portrait : files;
  return pool.sort((a, b) => b.height - a.height)[0];
}

const manifest = {};

if (!apiKey) {
  for (let index = 0; index < config.scenes.length; index++) {
    manifest[`s${index + 1}`] = {kind: 'none'};
  }
  fs.writeFileSync(brollFile, `${JSON.stringify(manifest, null, 2)}\n`);
  console.warn('PEXELS_API_KEY missing — b-roll disabled, typographic fallback will render.');
  console.warn(`wrote ${brollFile}`);
  process.exit(0);
}

for (let index = 0; index < config.scenes.length; index++) {
  const scene = config.scenes[index];
  const sceneId = `s${index + 1}`;
  const query = scene.broll;

  if (!query) {
    manifest[sceneId] = {kind: 'none'};
    continue;
  }

  const finalFile = path.join(buildDir, `${sceneId}.mp4`);
  if (fs.existsSync(finalFile) && !args.force) {
    manifest[sceneId] = {kind: 'video', file: finalFile};
    console.log(`b-roll cached: ${finalFile}`);
    continue;
  }

  try {
    let video;
    if (scene.pick) {
      const response = await fetch(`https://api.pexels.com/videos/videos/${scene.pick}`, {
        headers: {Authorization: apiKey},
      });
      if (!response.ok) throw new Error(`Pexels ${response.status} for video ${scene.pick}`);
      video = await response.json();
    } else {
      const results = await searchVideos(query);
      if (results.length === 0) throw new Error('no results');
      video = results[hashIndex(`${query}:${seed}`, results.length)];
    }

    const file = pickFile(video);
    if (!file) throw new Error('no usable mp4 file');

    const rawFile = path.join(rawDir, `${sceneId}.mp4`);
    if (!fs.existsSync(rawFile)) {
      const download = await fetch(file.link);
      if (!download.ok) throw new Error(`download ${download.status}`);
      fs.writeFileSync(rawFile, Buffer.from(await download.arrayBuffer()));
    }

    run('ffmpeg', [
      '-y',
      '-t',
      '10',
      '-i',
      rawFile,
      '-vf',
      'scale=-2:1920,crop=1080:1920,setsar=1,fps=30,eq=brightness=0.35:contrast=1.15',
      '-an',
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '20',
      '-movflags',
      '+faststart',
      finalFile,
    ]);

    manifest[sceneId] = {
      kind: 'video',
      file: finalFile,
      source: 'pexels',
      id: video.id,
      author: video.user?.name ?? null,
      url: video.url ?? null,
    };
    console.log(`b-roll ok: ${sceneId} "${query}" → ${finalFile}`);
  } catch (error) {
    manifest[sceneId] = {kind: 'none', error: error.message};
    console.warn(`b-roll failed for ${sceneId} "${query}": ${error.message}`);
  }

  await new Promise((resolve) => setTimeout(resolve, 350));
}

fs.writeFileSync(brollFile, `${JSON.stringify(manifest, null, 2)}\n`);

const seconds = fs.existsSync(path.join('content', id, 'voice.mp3'))
  ? ffprobeDuration(path.join('content', id, 'voice.mp3'))
  : null;

console.log(
  `b-roll done: ${Object.values(manifest).filter((entry) => entry.kind === 'video').length}/${
    config.scenes.length
  } scenes${seconds ? `, voice ${seconds.toFixed(1)} s` : ''}`,
);
