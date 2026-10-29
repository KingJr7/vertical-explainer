import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import type {SceneSpec} from '../types';
import {TOKENS} from '../design/tokens';
import {DUR, EASE} from '../design/motion';
import {enterOffset, exitOffset, handoffInset} from '../lib/transitions';
import {BRoll} from './BRoll';

export const Scene: React.FC<SceneSpec & {index: number}> = ({
  durationInFrames,
  broll,
  enter,
  exit,
  index,
}) => {
  const frame = useCurrentFrame();

  const enterP = interpolate(frame, [0, DUR.enter], [0, 1], {
    easing: EASE.out,
    extrapolateRight: 'clamp',
  });

  const exitP = interpolate(
    frame,
    [durationInFrames - DUR.exit, durationInFrames],
    [0, 1],
    {
      easing: EASE.in,
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  const handoffIn = enter.kind === 'handoff';
  const handoffOut = exit.kind === 'handoff';

  let transform = 'none';

  if (!handoffIn) {
    const incoming = enterOffset(enter.dir, enterP);
    const outgoing = handoffOut
      ? {x: 0, y: 0}
      : exitOffset(exit.dir, exitP);
    transform = `translate(${incoming.x + outgoing.x}%, ${
      incoming.y + outgoing.y
    }%)`;
  }

  const clipPath = handoffIn
    ? handoffInset(enter.dir, enterP)
    : undefined;

  const blur =
    enter.kind === 'whip'
      ? (1 - enterP) * 14 + (handoffOut ? 0 : exitP * 10)
      : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: TOKENS.bg,
        transform,
        clipPath,
        filter: blur > 0.1 ? `blur(${blur}px)` : undefined,
        overflow: 'hidden',
      }}
    >
      <BRoll spec={broll} durationInFrames={durationInFrames} index={index} />
    </AbsoluteFill>
  );
};
