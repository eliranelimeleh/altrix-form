import React from 'react';
import {Composition, Still, continueRender, delayRender} from 'remotion';
import '@fontsource/heebo/800.css';
import '@fontsource/heebo/900.css';
import '@fontsource/secular-one/hebrew-400.css';
import '@fontsource/rubik/700.css';
import '@fontsource/rubik/800.css';
import '@fontsource/rubik/900.css';
import {IH, IW, Welcome1, Welcome2, Welcome3, Welcome4} from './Welcome';
import {FPS, H, Main, TOTAL, W} from './Main';

const handle = delayRender('fonts');
Promise.all([
  document.fonts.load('900 80px Heebo', 'אבג'),
  document.fonts.load('800 80px Heebo', 'אבג'),
  document.fonts.load('400 80px "Secular One"', 'אבג'),
  document.fonts.load('800 80px Rubik', 'אבג'),
  document.fonts.load('900 80px Rubik', '10'),
  document.fonts.load('700 80px Rubik', 'אבג'),
]).then(() => continueRender(handle));

export const Root: React.FC = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={Math.round(TOTAL * FPS)} fps={FPS} width={W} height={H} />
    <Still id="Welcome1" component={Welcome1} width={IW} height={IH} />
    <Still id="Welcome2" component={Welcome2} width={IW} height={IH} />
    <Still id="Welcome3" component={Welcome3} width={IW} height={IH} />
    <Still id="Welcome3Grid" component={Welcome3} defaultProps={{grid: true}} width={IW} height={IH} />
    <Still id="Welcome4" component={Welcome4} width={IW} height={IH} />
  </>
);
