import React from 'react';
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import type {BrollSpec} from '../types';
import {TOKENS} from '../design/tokens';
import {FONT_FAMILY} from '../fonts';

const KenBurns: React.FC<{
  spec: BrollSpec;
  durationInFrames: number;
}> = ({spec, durationInFrames}) => {
  const frame = useCurrentFrame();
  const p = useCurrentFrame() / Math.max(1, durationInFrames - 1);

  const scale =
    spec.kenBurns === 'in'
      ? 1.06 + 0.08 * p
      : spec.kenBurns === 'out'
        ? 1.14 - 0.08 * p
        : 1.08;

  const shift = 26;
  const x =
    spec.kenBurns === 'left'
      ? (0.5 - p) * shift
      : spec.kenBurns === 'right'
        ? (p - 0.5) * shift
        : 0;

  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: `scale(${scale}) translateX(${x}px)`,
    filter: 'grayscale(0) contrast(1.1) brightness(1.5)',
  };

  if (!spec.src) return null;

  if (spec.kind === 'image') {
    return <Img src={staticFile(spec.src)} style={style} />;
  }

  return (
    <OffthreadVideo src={staticFile(spec.src)} muted style={style} />
  );
};

export const BRoll: React.FC<{
  spec: BrollSpec;
  durationInFrames: number;
  index: number;
}> = ({spec, durationInFrames, index}) => {
  if (spec.kind === 'none' || !spec.src) {
    return (
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 80% at 50% 40%, #171717 0%, ${TOKENS.bg} 70%)`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: TOKENS.safe.top,
            left: TOKENS.safe.side,
            fontFamily: FONT_FAMILY,
            fontWeight: 700,
            fontSize: 260,
            lineHeight: 0.9,
            letterSpacing: '-0.04em',
            color: TOKENS.fg,
            opacity: 0.06,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </div>
        <div
          style={{
            position: 'absolute',
            left: TOKENS.safe.side,
            right: TOKENS.safe.side,
            top: 0,
            height: 1,
            backgroundColor: TOKENS.fg,
            opacity: 0.16,
          }}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <KenBurns spec={spec} durationInFrames={durationInFrames} />
    </AbsoluteFill>
  );
};