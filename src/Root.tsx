import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import {DEFAULT_PROPS} from './defaultProps';
import {TOKENS} from './design/tokens';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Video"
      component={Video}
      durationInFrames={DEFAULT_PROPS.durationInFrames}
      fps={TOKENS.fps}
      width={TOKENS.width}
      height={TOKENS.height}
      defaultProps={DEFAULT_PROPS}
      calculateMetadata={({props}) => ({
        durationInFrames: Math.max(1, props.durationInFrames),
        fps: props.fps,
        width: props.width,
        height: props.height,
      })}
    />
  );
};
