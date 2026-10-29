import {describe, expect, it} from 'vitest';
import {
  directionIsContinuous,
  enterOffset,
  exitOffset,
} from '../src/lib/transitions';
import type {Dir} from '../src/types';

describe('transitions', () => {
  const dirs: Dir[] = ['left', 'right', 'up', 'down'];

  it('tiles outgoing and incoming scenes without a gap', () => {
    for (const dir of dirs) {
      for (const p of [0, 0.25, 0.5, 0.75, 1]) {
        const incoming = enterOffset(dir, p);
        const outgoing = exitOffset(dir, p);

        if (dir === 'left') {
          expect(outgoing.x + 100).toBeCloseTo(incoming.x, 6);
        }
        if (dir === 'right') {
          expect(incoming.x + 100).toBeCloseTo(outgoing.x, 6);
        }
        if (dir === 'up') {
          expect(outgoing.y + 100).toBeCloseTo(incoming.y, 6);
        }
        if (dir === 'down') {
          expect(incoming.y + 100).toBeCloseTo(outgoing.y, 6);
        }
      }
    }
  });

  it('starts fully offscreen and ends at rest', () => {
    for (const dir of dirs) {
      const start = enterOffset(dir, 0);
      const end = enterOffset(dir, 1);
      expect(Math.abs(start.x) + Math.abs(start.y)).toBeCloseTo(100, 6);
      expect(end.x).toBeCloseTo(0, 6);
      expect(end.y).toBeCloseTo(0, 6);
      expect(exitOffset(dir, 0).x).toBeCloseTo(0, 6);
      expect(exitOffset(dir, 0).y).toBeCloseTo(0, 6);
    }
  });

  it('accepts only matching directions', () => {
    expect(directionIsContinuous('left', 'left')).toBe(true);
    expect(directionIsContinuous('left', 'right')).toBe(false);
    expect(directionIsContinuous('none', 'up')).toBe(true);
  });
});
