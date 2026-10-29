import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

export const Breath: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = 1 + 0.004 * Math.sin((2 * Math.PI * frame) / (fps * 8));

  return (
    <AbsoluteFill style={{transform: `scale(${scale})`}}>{children}</AbsoluteFill>
  );
};
