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
