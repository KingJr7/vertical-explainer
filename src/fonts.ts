import {staticFile} from 'remotion';

export const FONT_FAMILY = 'Inter';

export const FONT_CSS = `
@font-face {
  font-family: '${FONT_FAMILY}';
  src: url('${staticFile('fonts/Inter-latin.woff2')}') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: block;
}
`;
