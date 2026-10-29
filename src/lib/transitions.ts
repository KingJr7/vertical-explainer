import type {Dir} from '../types';

export function enterOffset(dir: Dir, p: number): {x: number; y: number} {
  const q = 1 - p;

  switch (dir) {
    case 'left':
      return {x: q * 100, y: 0};
    case 'right':
      return {x: -q * 100, y: 0};
    case 'up':
      return {x: 0, y: q * 100};
    case 'down':
      return {x: 0, y: -q * 100};
    default:
      return {x: 0, y: 0};
  }
}

export function exitOffset(dir: Dir, p: number): {x: number; y: number} {
  switch (dir) {
    case 'left':
      return {x: -p * 100, y: 0};
    case 'right':
      return {x: p * 100, y: 0};
    case 'up':
      return {x: 0, y: -p * 100};
    case 'down':
      return {x: 0, y: p * 100};
    default:
      return {x: 0, y: 0};
  }
}

export function handoffInset(dir: Dir, enterP: number): string {
  const p = (1 - enterP) * 100;

  switch (dir) {
    case 'left':
      return `inset(0 0 0 ${p}%)`;
    case 'right':
      return `inset(0 ${p}% 0 0)`;
    case 'up':
      return `inset(${p}% 0 0 0)`;
    case 'down':
      return `inset(0 0 ${p}% 0)`;
    default:
      return 'inset(0 0 0 0)';
  }
}

export function directionIsContinuous(exitDir: Dir, enterDir: Dir): boolean {
  return exitDir === enterDir || exitDir === 'none' || enterDir === 'none';
}
