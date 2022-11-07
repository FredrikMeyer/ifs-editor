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

/**
 * Map from interval fromInterval to toInterval.
 * @param fromInterval
 * @param toInterval
 * @param x
 * @returns A point in the mapped interval.
 * @deprecated Prefer mapFromInterval, which is faster.
 */
export function mapInterval(
  fromInterval: Interval,
  toInterval: Interval,
  x: number
) {
  const [A, B] = fromInterval;
  const [C, D] = toInterval;
  return ((D - C) / (B - A)) * (x - A) + C;
}

/**
 * Map from one interval to another. Prefer this over mapInterval because
 * it does not use destructuring, which gives a 15% performance boost,
 * per vitest bench tests. In fact, in practice, the JIT probably made this
 * much faster after a few in-browser runs (it does no longer show up in the Chrome profiler).

 * @param a
 * @param b
 * @param c
 * @param d
 * @param x
 * @returns The transformed point.
 */
export function mapFromInterval(
  a: number,
  b: number,
  c: number,
  d: number,
  x: number
) {
  return ((d - c) / (b - a)) * (x - a) + c;
}

export function countByValue<E>(vals: E[]): Map<E, number> {
  const m = new Map<E, number>();
  vals.forEach((v) => {
    const current = m.get(v);
    if (current) {
      m.set(v, current + 1);
    } else {
      m.set(v, 1);
    }
  });

  return m;
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("mapinterval", () => {
    const answer = mapFromInterval(0, 1, 0, 2, 1);
    expect(answer).toBe(2);
  });

  it("handles negatives", () => {
    const answer = mapFromInterval(0, 10, 10, 0, 5);
    expect(answer).toBe(5);
  });

  it("Handles direction", () => {
    const answer1 = mapFromInterval(0, 1, 1, 0, 0);
    expect(answer1).toBe(1);

    const answer2 = mapFromInterval(0, 1, 1, 0, 1);
    expect(answer2).toBe(0);
  });

  it("countyByValue works", () => {
    const res1 = countByValue([1, 1, 1, 1]);
    expect(res1).toStrictEqual(new Map([[1, 4]]));

    const res2 = countByValue([1, 1, 2, 2, 2.5]);
    expect(res2).toStrictEqual(
      new Map([
        [1, 2],
        [2, 2],
        [2.5, 1],
      ])
    );
  });

  it("probToIndex works", () => {
    const a = probToIndex([0.5, 0.5], 0.1);

    expect(a).toEqual(0);

    const b = probToIndex([0.1, 0.2, 0.7], 0.5);

    expect(b).toEqual(2);
  });

  it("probtoIndex for high values", () => {
    const a = probToIndex([0.4, 0.6], 1);

    expect(a).toEqual(1);
  });
}
