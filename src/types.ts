export type Dir = 'up' | 'down' | 'left' | 'right' | 'none';
export type TransitionKind = 'push' | 'whip' | 'handoff';

export interface Transition {
  kind: TransitionKind;
  dir: Dir;
}

export interface BrollSpec {
  kind: 'video' | 'image' | 'none' | 'art';
  src: string | null;
  kenBurns: 'in' | 'out' | 'left' | 'right';
  art?: string | null;
}

export interface SceneSpec {
  id: string;
  startFrame: number;
  durationInFrames: number;
  text: string;
  broll: BrollSpec;
  enter: Transition;
  exit: Transition;
  accent: string | null;
  invert: boolean;
}

export interface Word {
  text: string;
  startFrame: number;
  endFrame: number;
}

export interface CaptionPage {
  startFrame: number;
  endFrame: number;
  words: Word[];
  accent?: string | null;
}

export interface SfxCue {
  name: string;
  frame: number;
  gainDb: number;
  pan: number;
}

export type VideoProps = {
  id: string;
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  accent: string;
  scenes: SceneSpec[];
  captions: CaptionPage[];
  invertAtFrame: number | null;
  sfx: SfxCue[];
};
