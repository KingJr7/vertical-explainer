import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import type {CaptionSegment} from '../types';
import {TOKENS} from '../design/tokens';
import {DUR} from '../design/motion';
import {FONT_FAMILY} from '../fonts';

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}'-]/gu, '');

export const CaptionSegment: React.FC<CaptionSegment> = ({
  words,
  accent,
}) => {
  const frame = useCurrentFrame();

  const activeIndex = words.reduce(
    (acc, word, index) => (frame >= word.startFrame ? index : acc),
    -1,
  );

  const activeWord = activeIndex >= 0 ? words[activeIndex] : null;
  const wordOpacity = activeWord
    ? Math.min(
        1,
        Math.max(0, (frame - activeWord.startFrame) / 8),
      )
    : 0;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: TOKENS.bg,
        paddingLeft: TOKENS.safe.side,
        paddingRight: TOKENS.safe.side,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          columnGap: '0.26em',
          rowGap: '0.04em',
          fontFamily: FONT_FAMILY,
          fontSize: TOKENS.caption.size,
          fontWeight: TOKENS.caption.weight,
          lineHeight: TOKENS.caption.lineHeight,
          letterSpacing: TOKENS.caption.tracking,
          color: TOKENS.fg,
          textAlign: 'center',
          textShadow: '0 4px 30px rgba(0,0,0,0.6)',
          opacity: wordOpacity,
        }}
      >
        {words.map((word, index) => {
          const local = Math.max(0, frame - word.startFrame);
          const progress = local / 8; // simple linear for now, spring if needed
          const isActive = index === activeIndex;
          const started = frame >= word.startFrame;
          const isAccent =
            accent != null && normalize(word.text) === normalize(accent);

          return (
            <span
              key={`${word.startFrame}-${index}`}
              style={{
                display: 'inline-block',
                opacity: isActive ? 1 : started ? 0.42 : 0.18,
                transform: `translateY(${(1 - progress) * 14}px) scale(${0.96 + 0.04 * progress})`,
                filter: `blur(${(1 - progress) * 6}px)`,
                color: isAccent && isActive ? TOKENS.accent : undefined,
                backgroundImage:
                  isAccent && isActive
                    ? `linear-gradient(${TOKENS.accent}, ${TOKENS.accent})`
                    : undefined,
                backgroundSize: '100% 6px',
                backgroundPosition: '0 100%',
                backgroundRepeat: 'no-repeat',
                paddingBottom: '0.04em',
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};