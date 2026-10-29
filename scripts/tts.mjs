import fs from 'node:fs';
import path from 'node:path';
import {
  fail,
  ffprobeDuration,
  loadEnv,
  parseArgs,
  readJson,
  run,
  sha256,
  writeJson,
} from './lib/util.mjs';

loadEnv();

const args = parseArgs(process.argv.slice(2));
const id = args.id ?? '001-silence';
const dir = path.join('content', id);
const scenesFile = path.join(dir, 'scenes.json');
const voiceFile = path.join(dir, 'voice.mp3');
const wordsFile = path.join(dir, 'words.json');
const metaFile = path.join(dir, 'voice.json');

if (!fs.existsSync(scenesFile)) fail(`missing ${scenesFile}`);
const scenes = readJson(scenesFile);

const text = scenes.scenes.map((scene) => scene.text).join(' ');
const voiceId = args.voice ?? process.env.ELEVENLABS_VOICE_ID ?? scenes.voice?.id;
const model =
  process.env.ELEVENLABS_MODEL ?? scenes.voice?.model ?? 'eleven_multilingual_v2';
const settings = {
  stability: 0.45,
  similarity_boost: 0.8,
  style: 0,
  use_speaker_boost: true,
};

if (!voiceId) fail('no voice id (set voice.id in scenes.json or ELEVENLABS_VOICE_ID)');

const hash = sha256(JSON.stringify({text, voiceId, model, settings}));

if (!args.force && fs.existsSync(voiceFile) && fs.existsSync(metaFile)) {
  const meta = readJson(metaFile);
  if (meta.hash === hash) {
    console.log(`TTS cached: ${voiceFile} (${meta.words} words, ${meta.durationMs} ms)`);
    process.exit(0);
  }
}

const apiKey = process.env.ELEVENLABS_API_KEY;

async function viaApi() {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {'xi-api-key': apiKey, 'Content-Type': 'application/json'},
    body: JSON.stringify({text, model_id: model, voice_settings: settings}),
  });

  if (!response.ok) {
    const body = await response.text();
    fail(`ElevenLabs API ${response.status}: ${body.slice(0, 400)}`);
  }

  return response.json();
}

function viaCli() {
  const raw = run(
    'npx',
    [
      '-y',
      '@elevenlabs/cli@latest',
      'text-to-speech',
      'convert_with_timestamps',
      '--voice-id',
      voiceId,
      '--text',
      text,
      '--model-id',
      model,
      '--output-format',
      'mp3_44100_128',
      '--format',
      'json',
      '--voice-settings',
      JSON.stringify(settings),
    ],
    {maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe']},
  );
  return JSON.parse(raw);
}

console.log(`TTS: ${text.length} chars, voice ${voiceId}, model ${model}`);

const data = apiKey ? await viaApi() : viaCli();
const alignment = data.alignment ?? data.normalized_alignment;

if (!data.audio_base64 || !alignment) {
  fail('ElevenLabs response missing audio_base64 or alignment');
}

fs.writeFileSync(voiceFile, Buffer.from(data.audio_base64, 'base64'));

const chars = alignment.characters;
const starts = alignment.character_start_times_seconds;
const ends = alignment.character_end_times_seconds;
const words = [];
let current = '';
let wordStart = 0;
let wordEnd = 0;

for (let i = 0; i < chars.length; i++) {
  const char = chars[i];
  if (/\s/.test(char)) {
    if (current) {
      words.push({
        text: current,
        startMs: Math.round(wordStart * 1000),
        endMs: Math.round(wordEnd * 1000),
      });
      current = '';
    }
  } else {
    if (!current) wordStart = starts[i];
    current += char;
    wordEnd = ends[i];
  }
}

if (current) {
  words.push({
    text: current,
    startMs: Math.round(wordStart * 1000),
    endMs: Math.round(wordEnd * 1000),
  });
}

for (let i = 0; i < words.length; i++) {
  if (words[i].endMs <= words[i].startMs) words[i].endMs = words[i].startMs + 40;
  if (i > 0 && words[i].startMs < words[i - 1].endMs) {
    words[i].startMs = words[i - 1].endMs;
    if (words[i].endMs <= words[i].startMs) words[i].endMs = words[i].startMs + 40;
  }
}

writeJson(wordsFile, {text, voiceId, model, words});

const durationMs = Math.round(ffprobeDuration(voiceFile) * 1000);
const spoken = text.trim().split(/\s+/);
if (spoken.length !== words.length) {
  console.warn(
    `warning: ${spoken.length} words in text, ${words.length} timed (punctuation-only tokens?)`,
  );
}

writeJson(metaFile, {
  hash,
  voiceId,
  model,
  settings,
  durationMs,
  chars: text.length,
  words: words.length,
  createdAt: new Date().toISOString(),
});

console.log(
  `TTS ok: ${voiceFile} — ${words.length} words, ${(durationMs / 1000).toFixed(1)} s`,
);
