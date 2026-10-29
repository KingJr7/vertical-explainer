import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import type {CaptionPage} from '../types';
import {TOKENS} from '../design/tokens';
import {DUR} from '../design/motion';
import {FONT_FAMILY} from '../fonts';

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}'-]/gu, '');

export const Captions: React.FC<{
  captions: CaptionPage[];
}> = ({captions}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const page = captions.find(
    (candidate) =>
      frame >= candidate.startFrame - 2 && frame <= candidate.endFrame + 3,
  );

  if (!page) return null;

  const activeIndex = page.words.reduce(
    (acc, word, index) => (frame >= word.startFrame ? index : acc),
    -1,
  );

  const pageOpacity = Math.min(
    interpolate(
      frame,
      [page.startFrame - 2, page.startFrame + 2],
      [0, 1],
      {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
    ),
    interpolate(
      frame,
      [page.endFrame - 1, page.endFrame + 3],
      [1, 0],
      {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
    ),
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        paddingBottom: TOKENS.safe.bottom,
        paddingLeft: TOKENS.safe.side,
        paddingRight: TOKENS.safe.side,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'flex-end',
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
          opacity: pageOpacity,
          textWrap: 'balance',
        }}
      >
        {page.words.map((word, index) => {
          const local = Math.max(0, frame - word.startFrame);
          const progress = spring({
            frame: local,
            fps,
            config: {damping: 18, stiffness: 180, mass: 0.6},
            durationInFrames: DUR.captionIn,
          });

          const isActive = index === activeIndex;
          const started = frame >= word.startFrame;
          const isAccent =
            page.accent != null &&
            normalize(word.text) === normalize(page.accent);

          return (
            <span
              key={`${word.startFrame}-${index}`}
              style={{
                display: 'inline-block',
                opacity: isActive ? 1 : started ? 0.42 : 0.18,
                transform: `translateY(${(1 - progress) * 14}px) scale(${
                  0.96 + 0.04 * progress
                })`,
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
