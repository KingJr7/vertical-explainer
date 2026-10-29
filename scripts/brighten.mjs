#!/usr/bin/env node
import {execFileSync} from 'node:child_process';
import {readJson, writeJson, parseArgs} from './lib/util.mjs';

const args = parseArgs(process.argv.slice(2));
const id = args.id ?? '001-silence';
const input = args.input ?? `out/${id}-final.mp4`;
const output = args.output ?? `out/${id}-bright.mp4`;
const brightness = parseFloat(args.brightness ?? '1.3');
const contrast = parseFloat(args.contrast ?? '1.15');

console.log(`Brightening ${input} -> ${output} (brightness=${brightness}, contrast=${contrast})`);

execFileSync('ffmpeg', [
  '-y',
  '-i', input,
  '-vf', `eq=brightness=${brightness - 1}:contrast=${contrast}`,
  '-c:a', 'copy',
  output,
], {stdio: 'inherit'});

console.log(`Brightened video saved to ${output}`);