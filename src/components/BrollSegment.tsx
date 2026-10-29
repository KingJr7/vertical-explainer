import React from 'react';
import {AbsoluteFill} from 'remotion';
import {OffthreadVideo, Img, staticFile} from 'remotion';
import type {BrollSegment} from '../types';
import {TOKENS} from '../design/tokens';

const MAX_BROLL_WIDTH = 900;
const MAX_BROLL_HEIGHT = 1600;
const BORDER_RADIUS = 32;

export const BrollSegment: React.FC<BrollSegment> = ({broll}) => {
  if (broll.kind === 'none' || !broll.src) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: TOKENS.bg,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: MAX_BROLL_WIDTH,
            height: MAX_BROLL_HEIGHT,
            borderRadius: BORDER_RADIUS,
            background: `radial-gradient(120% 80% at 50% 40%, #171717 0%, ${TOKENS.bg} 70%)`,
            border: `2px solid ${TOKENS.fg}`,
            opacity: 0.15,
          }}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: TOKENS.bg,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: MAX_BROLL_WIDTH,
          height: MAX_BROLL_HEIGHT,
          borderRadius: BORDER_RADIUS,
          overflow: 'hidden',
          border: `2px solid ${TOKENS.fg}`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {broll.kind === 'image' ? (
          <Img
            src={staticFile(broll.src!)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <OffthreadVideo
            src={staticFile(broll.src!)}
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};