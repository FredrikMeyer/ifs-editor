import { bench, describe } from "vitest";
import { IFSIterator } from "./ifs";
import { examples } from "./ifsExamples";
import { mapInterval, mapFromInterval, Interval } from "./util";

describe("ifs", () => {
  bench.skip("mandelbrot-like", () => {
    const iterator = new IFSIterator(examples.eq1);

    iterator.getPoints(100_000);
  });

  bench.skip("chaos", () => {
    const iterator = new IFSIterator(examples.chaos);

    iterator.getPoints(100_000);
  });
});

describe("map interval", () => {
  bench.skip("mapinterval", () => {
    for (let i = 0; i < 1000; i++) {
      const a = [0, Math.random() * 5] as Interval;
      const b = [Math.random() + 6, Math.random() + 8] as Interval;
      mapInterval(a, b, Math.random());
    }
  });

  bench.skip("mapinterval2", () => {
    for (let i = 0; i < 1000; i++) {
      const a = 0;
      const b = Math.random() * 5;
      const c = Math.random() + 6;
      const d = Math.random() + 8;
      mapFromInterval(a, b, c, d, Math.random());
    }
  });
});
