import type {VideoProps} from './types';
import {TOKENS} from './design/tokens';

export const DEFAULT_PROPS: VideoProps = {
  id: 'preview',
  fps: TOKENS.fps,
  width: TOKENS.width,
  height: TOKENS.height,
  durationInFrames: 90,
  accent: TOKENS.accent,
  invertAtFrame: null,
  sfx: [],
  scenes: [
    {
      id: 'a',
      startFrame: 0,
      durationInFrames: 38,
      text: 'Le silence fait plus peur.',
      broll: {kind: 'none', src: null, kenBurns: 'in'},
      enter: {kind: 'push', dir: 'up'},
      exit: {kind: 'push', dir: 'up'},
      accent: 'silence',
      invert: false,
    },
    {
      id: 'b',
      startFrame: 24,
      durationInFrames: 50,
      text: 'Pas la musique. Pas le cri.',
      broll: {kind: 'none', src: null, kenBurns: 'in'},
      enter: {kind: 'push', dir: 'up'},
      exit: {kind: 'push', dir: 'up'},
      accent: null,
      invert: false,
    },
    {
      id: 'c',
      startFrame: 60,
      durationInFrames: 30,
      text: 'Le vide.',
      broll: {kind: 'none', src: null, kenBurns: 'in'},
      enter: {kind: 'push', dir: 'up'},
      exit: {kind: 'push', dir: 'none'},
      accent: null,
      invert: false,
    },
  ],
  captions: [
    {
      startFrame: 0,
      endFrame: 26,
      accent: 'silence',
      words: [
        {text: 'Le', startFrame: 0, endFrame: 5},
        {text: 'silence', startFrame: 6, endFrame: 14},
        {text: 'fait', startFrame: 15, endFrame: 19},
        {text: 'plus', startFrame: 20, endFrame: 24},
        {text: 'peur.', startFrame: 25, endFrame: 30},
      ],
    },
    {
      startFrame: 34,
      endFrame: 66,
      accent: null,
      words: [
        {text: 'Pas', startFrame: 34, endFrame: 39},
        {text: 'la', startFrame: 40, endFrame: 43},
        {text: 'musique.', startFrame: 44, endFrame: 53},
        {text: 'Pas', startFrame: 55, endFrame: 59},
        {text: 'le', startFrame: 60, endFrame: 62},
        {text: 'cri.', startFrame: 63, endFrame: 68},
      ],
    },
    {
      startFrame: 72,
      endFrame: 84,
      accent: null,
      words: [
        {text: 'Le', startFrame: 72, endFrame: 75},
        {text: 'vide.', startFrame: 76, endFrame: 84},
      ],
    },
  ],
};
