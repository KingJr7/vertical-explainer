import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {TOKENS} from '../design/tokens';

export const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = Math.min(1, Math.max(0, frame / Math.max(1, durationInFrames - 1)));

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: TOKENS.progress.bottom,
          height: TOKENS.progress.height,
          width: `${p * 100}%`,
          backgroundColor: TOKENS.accent,
        }}
      />
    </AbsoluteFill>
  );
};
