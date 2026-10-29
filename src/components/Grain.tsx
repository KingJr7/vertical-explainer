import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

const NOISE = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320">
    <filter id="n">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="7"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#n)"/>
  </svg>`,
);

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const x = (frame * 17) % 320;
  const y = (frame * 29) % 320;

  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url("data:image/svg+xml,${NOISE}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '320px 320px',
        backgroundPosition: `${x}px ${y}px`,
        opacity: 0.07,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  );
};
