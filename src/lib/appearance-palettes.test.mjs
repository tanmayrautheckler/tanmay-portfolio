import test from 'node:test';
import assert from 'node:assert/strict';
import { clubPalettes, validPalette } from './appearance-palettes.ts';

function luminance(hex) {
  const [r, g, b] = hex.slice(1).match(/../g).map(value => {
    const channel = parseInt(value, 16) / 255;
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });
  return .2126 * r + .7152 * g + .0722 * b;
}
function contrast(a, b) { const l = [luminance(a), luminance(b)].sort((x, y) => y - x); return (l[0] + .05) / (l[1] + .05); }
for (const palette of clubPalettes) for (const mode of ['light', 'dark']) {
  test(`${palette.name} ${mode}: text and links pass WCAG AA normal-text contrast`, () => {
    const p = palette[mode];
    for (const text of ['foreground', 'muted', 'accent', 'accentHover']) for (const surface of ['background', 'surface']) {
      assert.ok(contrast(p[text], p[surface]) >= 4.5, `${text} on ${surface}: ${contrast(p[text], p[surface]).toFixed(2)}:1`);
    }
    const ink = mode === 'light' ? p.foreground : p.background;
    assert.ok(contrast(ink, p.highlight) >= 4.5, 'Text selection remains readable');
  });
}
test('saved theme IDs migrate safely and unknown values use Barcelona', () => {
  for (const id of clubPalettes.map(p => p.id)) assert.equal(validPalette(id), id);
  assert.equal(validPalette('missing'), 'barcelona');
  assert.equal(validPalette('citrus'), 'barcelona');
  assert.equal(validPalette('ocean'), 'madrid');
  assert.equal(validPalette(null), 'barcelona');
});
