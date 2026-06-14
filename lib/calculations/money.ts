const HUNDRED = 100n;

export function percentOf(value: number, percent: number): number {
  return Number(
    (BigInt(Math.trunc(value)) * BigInt(Math.trunc(percent))) / HUNDRED,
  );
}

export function ratioPercent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Number(
    (BigInt(Math.trunc(numerator)) * HUNDRED) / BigInt(Math.trunc(denominator)),
  );
}

export function divideRoundUp(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  const top = BigInt(Math.trunc(numerator));
  const bottom = BigInt(Math.trunc(denominator));
  return Number((top + bottom - 1n) / bottom);
}

export function multiplyDivide(
  first: number,
  second: number,
  divisor: number,
): number {
  if (divisor === 0) return 0;
  return Number(
    (BigInt(Math.trunc(first)) * BigInt(Math.trunc(second))) /
      BigInt(Math.trunc(divisor)),
  );
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + Math.trunc(value), 0);
}
