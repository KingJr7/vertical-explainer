import {describe, expect, it} from 'vitest';
import {chunkWords} from '../scripts/lib/chunk.mjs';

const word = (text, startFrame, endFrame) => ({text, startFrame, endFrame});

describe('chunkWords', () => {
  it('returns nothing for empty input', () => {
    expect(chunkWords([])).toEqual([]);
  });

  it('caps pages at 5 words', () => {
    const words = Array.from({length: 12}, (_, index) =>
      word(`w${index}`, index * 10, index * 10 + 6),
    );
    const pages = chunkWords(words, {fps: 30});
    for (const page of pages) {
      expect(page.words.length).toBeLessThanOrEqual(5);
      expect(page.words.length).toBeGreaterThanOrEqual(1);
    }
    expect(pages.flatMap((page) => page.words)).toHaveLength(12);
  });

  it('breaks on sentence end after the minimum', () => {
    const words = [
      word('Bonjour', 0, 8),
      word('le', 9, 11),
      word('monde.', 12, 20),
      word('Ensuite', 24, 30),
    ];
    const pages = chunkWords(words, {fps: 30});
    expect(pages).toHaveLength(2);
    expect(pages[0].words.map((item) => item.text)).toEqual([
      'Bonjour',
      'le',
      'monde.',
    ]);
  });

  it('breaks on long gaps and long durations', () => {
    const words = [
      word('a', 0, 5),
      word('b', 6, 10),
      word('c', 90, 95),
      word('d', 96, 100),
    ];
    const pages = chunkWords(words, {fps: 30, gapMs: 320});
    expect(pages).toHaveLength(2);
    expect(pages[1].words[0].text).toBe('c');
  });

  it('falls back to the last word end plus hold', () => {
    const words = [word('a', 0, 5), word('b', 6, 10)];
    const [page] = chunkWords(words, {fps: 30, holdFrames: 3});
    expect(page.startFrame).toBe(0);
    expect(page.endFrame).toBe(13);
  });
});
