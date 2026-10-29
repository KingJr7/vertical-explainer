const SENTENCE_END = /[.!?…:]$/;

export function chunkWords(words, options = {}) {
  const {
    minWords = 1,
    maxWords = 1,
    maxMs = 1500,
    gapMs = 320,
    fps = 30,
    holdFrames = 3,
  } = options;

  if (words.length === 0) return [];

  const maxFrames = Math.round((maxMs / 1000) * fps);
  const gapFrames = Math.round((gapMs / 1000) * fps);
  const pages = [];
  let current = [];

  const flush = () => {
    if (current.length === 0) return;
    const last = current[current.length - 1];
    pages.push({
      startFrame: current[0].startFrame,
      endFrame: last.endFrame + holdFrames,
      words: current,
    });
    current = [];
  };

  for (const word of words) {
    if (current.length > 0) {
      const first = current[0];
      const previous = current[current.length - 1];
      const tooManyWords = current.length >= maxWords;
      const tooLong = word.endFrame - first.startFrame > maxFrames;
      const tooBigGap = word.startFrame - previous.endFrame > gapFrames;
      const sentenceDone =
        SENTENCE_END.test(previous.text) && current.length >= minWords;

      if (tooManyWords || tooLong || tooBigGap || sentenceDone) {
        flush();
      }
    }

    current.push(word);
  }

  flush();
  return pages;
}
