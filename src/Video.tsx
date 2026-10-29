import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  cancelRender,
  continueRender,
  delayRender,
  Sequence,
  useCurrentFrame,
} from 'remotion';
import type {VideoProps} from './types';
import {TOKENS} from './design/tokens';
import {DUR} from './design/motion';
import {FONT_CSS, FONT_FAMILY} from './fonts';
import {Breath} from './components/Breath';
import {Grain} from './components/Grain';
import {Progress} from './components/Progress';
import {Captions} from './components/Captions';
import {Scene} from './components/Scene';
import {InvertFlash} from './components/Invert';

export const Video: React.FC<VideoProps> = (props) => {
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender('Loading Inter'));

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      await document.fonts.load(
        `${TOKENS.caption.weight} ${TOKENS.caption.size}px ${FONT_FAMILY}`,
      );
      await document.fonts.ready;
      if (!cancelled) continueRender(handle);
    };

    load().catch((error) => cancelRender(error));

    return () => {
      cancelled = true;
    };
  }, [handle]);

  const invertOn =
    props.invertAtFrame !== null &&
    frame >= props.invertAtFrame &&
    frame < props.invertAtFrame + DUR.invert;

  const flashing =
    props.invertAtFrame !== null &&
    frame >= props.invertAtFrame &&
    frame < props.invertAtFrame + DUR.flash;

  return (
    <AbsoluteFill style={{backgroundColor: TOKENS.bg}}>
      <style>{FONT_CSS}</style>
      <Breath>
        <AbsoluteFill
          style={{
            filter: invertOn ? 'invert(1) hue-rotate(180deg)' : undefined,
          }}
        >
          {props.scenes.map((scene, index) => (
            <Sequence
              key={scene.id}
              from={scene.startFrame}
              durationInFrames={scene.durationInFrames}
            >
              <Scene {...scene} index={index} />
            </Sequence>
          ))}
          <Captions captions={props.captions} />
        </AbsoluteFill>
      </Breath>
      <Grain />
      <Progress />
      {flashing ? <InvertFlash /> : null}
    </AbsoluteFill>
  );
};
