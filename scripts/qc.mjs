import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fail, parseArgs, run} from './lib/util.mjs';

const args = parseArgs(process.argv.slice(2));
const file = args.file ?? 'out/001-silence.mp4';
const expectedWidth = Number(args.width ?? 1080);
const expectedHeight = Number(args.height ?? 1920);
const expectedFps = Number(args.fps ?? 30);
const minDuration = Number(args.min ?? 30);
const maxDuration = Number(args.max ?? 60);

if (!fs.existsSync(file)) fail(`missing ${file}`);

const probe = JSON.parse(
  run('ffprobe', [
    '-v',
    'error',
    '-print_format',
    'json',
    '-show_format',
    '-show_streams',
    file,
  ]),
);

const video = probe.streams.find((stream) => stream.codec_type === 'video');
const audio = probe.streams.find((stream) => stream.codec_type === 'audio');
if (!video) fail('no video stream');
if (!audio) fail('no audio stream');

const duration = Number(probe.format.duration);
const [num, den] = String(video.avg_frame_rate ?? '0/1').split('/').map(Number);
const fps = den ? num / den : 0;

let loudness = null;
const analysis = spawnSync(
  'ffmpeg',
  ['-hide_banner', '-i', file, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'],
  {encoding: 'utf8'},
);
const match = String(analysis.stderr ?? '').match(/\{[\s\S]*?"input_i"[\s\S]*?\}/);
if (match) {
  try {
    loudness = JSON.parse(match[0]);
  } catch {
    loudness = null;
  }
}

const checks = [
  ['video codec h264', video.codec_name === 'h264'],
  ['audio codec aac', audio.codec_name === 'aac'],
  [`resolution ${expectedWidth}x${expectedHeight}`, video.width === expectedWidth && video.height === expectedHeight],
  [`fps ${expectedFps}`, Math.abs(fps - expectedFps) < 0.01],
  [`audio 48 kHz`, Number(audio.sample_rate) === 48000],
  [`duration ${minDuration}–${maxDuration} s`, duration >= minDuration && duration <= maxDuration],
  ['loudness -15…-13 LUFS', loudness ? Number(loudness.input_i) >= -15 && Number(loudness.input_i) <= -13 : false],
  ['true peak ≤ -1.0 dBTP', loudness ? Number(loudness.input_tp) <= -1.0 : false],
];

let failed = false;
console.log(`QC ${file}`);
for (const [label, ok] of checks) {
  console.log(`  ${ok ? '✓' : '✗'} ${label}`);
  if (!ok) failed = true;
}

console.log(
  `  duration ${duration.toFixed(2)} s · ${video.width}x${video.height} · ${fps.toFixed(
    2,
  )} fps · ${loudness ? `${loudness.input_i} LUFS / ${loudness.input_tp} dBTP` : 'loudness unavailable'}`,
);

if (failed) process.exit(1);
