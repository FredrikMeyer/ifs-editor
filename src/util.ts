import { Color } from "./colors";

export type Interval = [number, number];

export type Point = {
  x: number;
  y: number;
};

export type ColoredPoint = Point & { color: Color };

export function probToIndex(probs: number[], prob: number) {
  let c = 0;
  for (let i = 0; i < probs.length; i++) {
    c += probs[i];
    if (prob < c) {
      return i;
    }
  }
  return probs.length - 1;
}

export function mapInterval(
  fromInterval: Interval,
  toInterval: Interval,
  x: number
) {
  const [A, B] = fromInterval;
  const [C, D] = toInterval;
  return ((D - C) / (B - A)) * (x - A) + C;
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("mapinterval", () => {
    const answer = mapInterval([0, 1], [0, 2], 1);
    expect(answer).toBe(2);
  });

  it("handles negatives", () => {
    const answer = mapInterval([0, 10], [10, 0], 5);
    expect(answer).toBe(5);
  });

  it("Handles direction", () => {
    const answer1 = mapInterval([0, 1], [1, 0], 0);
    expect(answer1).toBe(1);

    const answer2 = mapInterval([0, 1], [1, 0], 1);
    expect(answer2).toBe(0);
  });
}
