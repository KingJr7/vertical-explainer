import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  delayRender,
  continueRender,
} from 'remotion';
import type {BrollSpec} from '../types';
import {TOKENS} from '../design/tokens';
import {FONT_FAMILY} from '../fonts';

const KenBurns: React.FC<{
  spec: BrollSpec;
  durationInFrames: number;
}> = ({spec, durationInFrames}) => {
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender('Loading B-roll video'));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (spec.src && spec.kind === 'video') {
      const video = document.createElement('video');
      video.src = staticFile(spec.src);
      video.muted = true;
      video.preload = 'auto';
      
      const onLoad = () => {
        setLoaded(true);
        continueRender(handle);
      };
      video.oncanplaythrough = onLoad;
      video.onerror = () => {
        console.error('Failed to load B-roll:', spec.src);
        continueRender(handle);
      };
      video.load();
      
      return () => {
        video.oncanplaythrough = null;
        video.onerror = null;
      };
    } else {
      continueRender(handle);
    }
  }, [handle, spec.src, spec.kind]);

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
    filter: 'grayscale(1) contrast(1.06) brightness(0.9)',
    opacity: loaded ? 1 : 0,
    transition: 'opacity 0.3s ease',
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
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.12) 30%, rgba(0,0,0,0.22) 55%, rgba(0,0,0,0.82) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
