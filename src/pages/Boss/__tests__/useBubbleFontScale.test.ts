import { calculateFontSize } from '../hooks/useBubbleFontScale';

describe('useBubbleFontScale / calculateFontSize', () => {
  const defaultMin = 12;
  const defaultMax = 32;

  it('calculates font size proportionally for M curve', () => {
    // 1920px container, 10vw bubble = 192px diameter
    // 192 * 0.15 = 28.8px
    const result = calculateFontSize(1920, 10, 'M', defaultMin, defaultMax);
    expect(result).toBeCloseTo(28.8);
  });

  it('calculates smaller font size for S curve', () => {
    // 1920px container, 10vw bubble = 192px diameter
    // 192 * 0.12 = 23.04px
    const result = calculateFontSize(1920, 10, 'S', defaultMin, defaultMax);
    expect(result).toBeCloseTo(23.04);
  });

  it('calculates larger font size for L curve', () => {
    // 1920px container, 10vw bubble = 192px diameter
    // 192 * 0.18 = 34.56px -> capped at 32px max
    const result = calculateFontSize(1920, 10, 'L', defaultMin, defaultMax);
    expect(result).toBe(32);
  });

  it('clamps to minFontSize for very small screens/bubbles', () => {
    // 375px container, 5vw bubble = 18.75px diameter
    // 18.75 * 0.15 = 2.8125px -> bumped to 3.375px -> clamped to 12px
    const result = calculateFontSize(375, 5, 'M', defaultMin, defaultMax);
    expect(result).toBe(12);
  });

  it('applies non-linear bump for bubbles smaller than 100px diameter', () => {
    // 800px container, 10vw bubble = 80px diameter
    // 80 * 0.15 = 12px
    // Since < 100px, 12 * 1.2 = 14.4px
    const result = calculateFontSize(800, 10, 'M', defaultMin, defaultMax);
    expect(result).toBeCloseTo(14.4);
  });
});
