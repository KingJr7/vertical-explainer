import fs from 'node:fs';
import path from 'node:path';
import {fail, loadEnv, parseArgs, run} from './lib/util.mjs';

loadEnv();

const args = parseArgs(process.argv.slice(2));
const id = args.id ?? '001-silence';
const scale = Number(args.scale ?? 1);
const dir = path.join('content', id);
const voiceFile = path.join(dir, 'voice.mp3');
const propsFile = path.join(dir, 'props.json');
const outDir = 'out';
fs.mkdirSync(outDir, {recursive: true});

const suffix = scale < 1 ? '-preview' : '';
const videoFile = path.join(outDir, `${id}-video${suffix}.mp4`);
const mixFile = path.join(dir, 'build', 'mix.wav');
const finalFile = path.join(outDir, `${id}${suffix}.mp4`);

if (!args['skip-broll']) {
  run('node', ['scripts/fetch-broll.mjs', '--id', id], {stdio: 'inherit'});
}

if (!fs.existsSync(voiceFile)) {
  run('node', ['scripts/tts.mjs', '--id', id], {stdio: 'inherit'});
}

run('node', ['scripts/build-props.mjs', '--id', id], {stdio: 'inherit'});

run(
  'npx',
  [
    'remotion',
    'render',
    'Video',
    videoFile,
    `--props=${propsFile}`,
    '--gl=swangle',
    `--concurrency=${args.concurrency ?? 4}`,
    '--crf=18',
    `--scale=${scale}`,
  ],
  {stdio: 'inherit'},
);

run('node', ['scripts/mix.mjs', '--id', id], {stdio: 'inherit'});

const brightenedVideoFile = path.join(outDir, `${id}-video${suffix}-bright.mp4`);
run('node', ['scripts/brighten.mjs', '--input', videoFile, '--output', brightenedVideoFile], {stdio: 'inherit'});

run('ffmpeg', [
  '-y',
  '-i',
  brightenedVideoFile,
  '-i',
  mixFile,
  '-map',
  '0:v:0',
  '-map',
  '1:a:0',
  '-c:v',
  'copy',
  '-c:a',
  'aac',
  '-b:a',
  '192k',
  '-ar',
  '48000',
  '-movflags',
  '+faststart',
  '-shortest',
  finalFile,
]);

run(
  'node',
  [
    'scripts/qc.mjs',
    '--file',
    finalFile,
    '--width',
    String(Math.round(1080 * scale)),
    '--height',
    String(Math.round(1920 * scale)),
  ],
  {stdio: 'inherit'},
);

console.log(`\nvideo ok: ${finalFile}`);
