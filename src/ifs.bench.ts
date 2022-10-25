import { bench, describe } from "vitest";
import { IFSIterator } from "./ifs";
import { examples } from "./ifsExamples";

describe("ifs", () => {
  bench("mandelbrot-like", () => {
    const iterator = new IFSIterator(examples.eq1);

    iterator.getPoints(100_000);
  });

  bench("chaos", () => {
    const iterator = new IFSIterator(examples.chaos);

    iterator.getPoints(100_000);
  });
});
