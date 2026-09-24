import React from 'react';
import {Composition, continueRender, delayRender} from 'remotion';
import '@fontsource/heebo/800.css';
import '@fontsource/heebo/900.css';
import {FPS, H, Main, TOTAL, W} from './Main';

const handle = delayRender('fonts');
Promise.all([
  document.fonts.load('900 80px Heebo', 'אבג'),
  document.fonts.load('800 80px Heebo', 'אבג'),
]).then(() => continueRender(handle));

export const Root: React.FC = () => (
  <Composition id="Main" component={Main} durationInFrames={Math.round(TOTAL * FPS)} fps={FPS} width={W} height={H} />
);
