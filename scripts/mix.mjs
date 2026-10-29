import fs from 'node:fs';
import path from 'node:path';
import {ensureDir, fail, parseArgs, readJson, run} from './lib/util.mjs';

const args = parseArgs(process.argv.slice(2));
const id = args.id ?? '001-silence';
const dir = path.join('content', id);
const voiceFile = path.join(dir, 'voice.mp3');
const propsFile = path.join(dir, 'props.json');
const buildDir = path.join(dir, 'build');
const outFile = path.join(buildDir, 'mix.wav');

if (!fs.existsSync(voiceFile)) fail(`missing ${voiceFile}`);
if (!fs.existsSync(propsFile)) fail(`missing ${propsFile} — run build-props first`);

const props = readJson(propsFile);
const duration = props.durationInFrames / props.fps;
ensureDir(buildDir);

const cues = props.sfx ?? [];
const inputs = ['-i', voiceFile, '-f', 'lavfi', '-t', String(duration), '-i',
  `anoisesrc=color=pink:sample_rate=48000:amplitude=0.02:duration=${duration}`];

for (const cue of cues) {
  const file = path.join('public', 'sfx', `${cue.name}.mp3`);
  if (!fs.existsSync(file)) fail(`missing SFX ${file}`);
  inputs.push('-i', file);
}

const filters = [
  '[0:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,highpass=f=70[voice]',
  '[1:a]lowpass=f=400,volume=0.25,aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo[room]',
];

const labels = ['[voice]', '[room]'];

cues.forEach((cue, index) => {
  const input = index + 2;
  const left = Math.min(1, 1 - cue.pan).toFixed(3);
  const right = Math.min(1, 1 + cue.pan).toFixed(3);
  const delay = Math.max(0, Math.round((cue.frame / props.fps) * 1000));
  const label = `[s${index}]`;

  filters.push(
    `[${input}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,` +
      `volume=${cue.gainDb}dB,pan=stereo|c0=${left}*c0|c1=${right}*c0,` +
      `adelay=${delay}|${delay}${label}`,
  );
  labels.push(label);
});

filters.push(
  `${labels.join('')}amix=inputs=${labels.length}:duration=longest:normalize=0:dropout_transition=0,` +
    `alimiter=limit=0.95,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[out]`,
);

const filterFile = path.join(buildDir, 'mix.filter');
fs.writeFileSync(filterFile, `${filters.join(';\n')}\n`);

run('ffmpeg', [
  '-y',
  ...inputs,
  '-filter_complex_script',
  filterFile,
  '-map',
  '[out]',
  '-t',
  String(duration),
  '-c:a',
  'pcm_s16le',
  '-ar',
  '48000',
  outFile,
]);

console.log(`mix ok: ${outFile} (${cues.length} sfx cues, ${duration.toFixed(2)} s)`);
