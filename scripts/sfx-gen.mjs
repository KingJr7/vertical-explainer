import fs from 'node:fs';
import path from 'node:path';
import {ensureDir, loadEnv, parseArgs, run} from './lib/util.mjs';

loadEnv();

const args = parseArgs(process.argv.slice(2));
const outDir = path.join('public', 'sfx');
ensureDir(outDir);

const useEleven = Boolean(process.env.ELEVENLABS_API_KEY && args.elevenlabs);

const RECIPES = [
  {
    name: 'whoosh-soft',
    prompt: 'A soft airy whoosh, subtle, short, smooth, no music, cinematic transition',
    duration: 0.5,
    source: 'anoisesrc=color=white:duration=0.55:sample_rate=48000:amplitude=0.45',
    filter:
      'highpass=f=500,lowpass=f=3500,afade=t=in:st=0:d=0.18,afade=t=out:st=0.27:d=0.28,volume=0.7',
  },
  {
    name: 'whoosh-hard',
    prompt: 'A fast sharp whoosh, hard cut transition, air movement, short, no music',
    duration: 0.35,
    source: 'anoisesrc=color=white:duration=0.4:sample_rate=48000:amplitude=0.6',
    filter:
      'highpass=f=900,lowpass=f=7500,afade=t=in:st=0:d=0.06,afade=t=out:st=0.15:d=0.25,volume=0.85',
  },
  {
    name: 'sub-hit',
    prompt: 'A deep cinematic sub hit, low impact boom, short tail, dark, no music',
    duration: 0.9,
    source: 'sine=frequency=52:duration=0.95:sample_rate=48000',
    filter: 'afade=t=out:st=0.04:d=0.9,volume=2.2,alimiter=limit=0.8',
  },
  {
    name: 'riser-reverse',
    prompt: 'A reversed riser, airy swelling tension, no pitch, short, no music',
    duration: 0.7,
    source: 'anoisesrc=color=pink:duration=0.75:sample_rate=48000:amplitude=0.4',
    filter:
      'highpass=f=300,lowpass=f=6000,afade=t=in:st=0:d=0.72,volume=0.8',
  },
  {
    name: 'downlifter',
    prompt: 'A soft downward air sweep, deflating tension, short, dark, no music',
    duration: 0.6,
    source: 'anoisesrc=color=pink:duration=0.65:sample_rate=48000:amplitude=0.35',
    filter:
      'lowpass=f=1400,afade=t=out:st=0:d=0.62,volume=0.8',
  },
  {
    name: 'tick',
    prompt: 'A tiny dry UI tick, single click, clean, quiet, no music',
    duration: 0.06,
    source: 'sine=frequency=1800:duration=0.06:sample_rate=48000',
    filter: 'afade=t=out:st=0.004:d=0.05,volume=0.5',
  },
  {
    name: 'shimmer',
    prompt: 'A short glassy shimmer, high sparkle, quiet, cinematic accent, no music',
    duration: 0.6,
    source: 'sine=frequency=2600:duration=0.65:sample_rate=48000',
    filter:
      'tremolo=f=16:d=0.6,afade=t=out:st=0.1:d=0.55,volume=0.25',
  },
];

async function viaEleven(recipe) {
  const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: recipe.prompt,
      duration_seconds: recipe.duration,
      prompt_influence: 0.5,
    }),
  });
  if (!response.ok) {
    throw new Error(`SFX ${recipe.name}: ${response.status} ${await response.text()}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

for (const recipe of RECIPES) {
  const file = path.join(outDir, `${recipe.name}.mp3`);
  if (fs.existsSync(file) && !args.force) {
    console.log(`sfx cached: ${file}`);
    continue;
  }

  if (useEleven) {
    try {
      fs.writeFileSync(file, await viaEleven(recipe));
      console.log(`sfx (elevenlabs): ${file}`);
      continue;
    } catch (error) {
      console.warn(`${error.message} — falling back to ffmpeg`);
    }
  }

  run('ffmpeg', [
    '-y',
    '-f',
    'lavfi',
    '-i',
    recipe.source,
    '-af',
    `${recipe.filter},aformat=channel_layouts=stereo`,
    '-t',
    String(recipe.duration),
    '-ar',
    '48000',
    '-b:a',
    '192k',
    file,
  ]);
  console.log(`sfx (ffmpeg): ${file}`);
}

console.log('SFX ready. Replace with ElevenLabs by running: node scripts/sfx-gen.mjs --elevenlabs --force');
