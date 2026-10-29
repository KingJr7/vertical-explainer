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

const Art: React.FC<{seed: string}> = ({seed}) => {
  const frame = useCurrentFrame();
  const lines = seed
    .split('')
    .map((ch, i) => ({ch, len: 20 + ((i * 7) % 40), delay: i * 2}))
    .filter((l) => l.len > 0);

  const total = lines.length * 14;
  const progress = Math.min(1, frame / 20);

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1080 1920"
      preserveAspectRatio="xMidYMid slice"
      style={{position: 'absolute', inset: 0, overflow: 'hidden'}}
    >
      <defs>
        <linearGradient id={`art-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F4F4F0" />
          <stop offset="100%" stopColor="#F4F4F0" />
        </linearGradient>
      </defs>
      {lines.map((line, i) => {
        const drawEnd = line.delay + line.len;
        const drawP = Math.min(1, Math.max(0, (frame - line.delay) / line.len));
        const visible = frame >= line.delay;
        const len = line.len * (1 - drawP);
        const x2 = 540 + ((i * 137) % 300) - len / 2;
        const y2 = 960 + ((i * 89) % 600) - len / 2;
        const x1 = x2 - len;
        const y1 = y2 - len;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={`url(#art-${seed})`}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={line.len}
            strokeDashoffset={visible ? line.len * (1 - drawP) : line.len}
            opacity={visible ? 0.9 : 0}
          />
        );
      })}
    </svg>
  );
};

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
  if (spec.kind === 'none') {
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

  if (spec.kind === 'art') {
    return (
      <AbsoluteFill style={{backgroundColor: TOKENS.bg}}>
        <AbsoluteFill
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '86%',
            height: '74%',
            transform: 'translate(-50%, -50%)',
            borderRadius: 36,
            overflow: 'hidden',
            backgroundColor: '#000',
          }}
        >
          <Art seed={spec.art ?? 'line-art'} />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{backgroundColor: TOKENS.bg}}>
      <AbsoluteFill
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '86%',
          height: '74%',
          transform: 'translate(-50%, -50%)',
          borderRadius: 36,
          overflow: 'hidden',
          backgroundColor: '#000',
        }}
      >
        <KenBurns spec={spec} durationInFrames={durationInFrames} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};