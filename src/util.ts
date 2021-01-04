import { useState, useCallback } from "react";

export type Interval = [number, number];

export function useForceUpdate() {
  const [, setTick] = useState(0);
  const update = useCallback(() => {
    setTick((tick) => tick + 1);
  }, []);
  return update;
}

export type Point = {
  x: number;
  y: number;
};

export function probToIndex(probs: number[], prob: number) {
  let c = probs[0];
  for (let i = 0; i < probs.length; i++) {
    if (prob < c) {
      return i;
    }
    c += probs[i];
  }
  return probs.length - 1;
}

export function mapInterval(
  fromInterval: Interval,
  toInterval: Interval,
  x: number
) {
  let [A, B] = fromInterval;
  let [C, D] = toInterval;
  return ((D - C) / (B - A)) * (x - A) + C;
}
