// Rounds up to a "nice" number (1, 2, or 5 times a power of ten) so a
// chart's axis extent reads as a clean reference value instead of an
// arbitrary exact maximum.
export const niceCeil = (value) => {
  if (value <= 0) return 0.001;
  const exponent = Math.floor(Math.log10(value));
  const base = Math.pow(10, exponent);
  const fraction = value / base;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * base;
};
