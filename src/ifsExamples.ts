import { BLUE, RED, GREEN, BROWN, randomColor } from "./colors";
import { IFSEquation } from "./ifs";

const chaosProb = 0.05263157895;

export const exampleNames = [
  "eq1",
  "spirals",
  "chaos",
  "barnsley",
  "blackSpleenwort",
] as const;
export type Examples = typeof exampleNames[number];

export const examples: Record<Examples, IFSEquation> = {
  eq1: {
    defaultView: {
      xMin: -1,
      xMax: 1,
      yMin: -1,
      yMax: 1,
    },
    parts: [
      {
        probability: 0.5,
        color: BLUE,
        coefficients: {
          a: 0.202,
          b: -0.805,
          c: -0.689,
          d: -0.342,
          e: -0.373,
          f: -0.653,
        },
      },
      {
        probability: 0.5,
        color: RED,
        coefficients: {
          a: 0.138,
          b: 0.665,
          c: -0.502,
          d: -0.222,
          e: 0.66,
          f: -0.277,
        },
      },
    ],
  },
  spirals: {
    defaultView: {
      xMin: -2,
      xMax: 2,
      yMin: 0,
      yMax: 4,
    },
    parts: [
      {
        probability: 0.7,
        color: RED,
        coefficients: {
          a: 0.787879,
          b: -0.424242,
          c: 0.242424,
          d: 0.859848,
          e: 0.758647,
          f: 0.5,
        },
      },
      {
        probability: 0.15,
        color: BLUE,
        coefficients: {
          a: -0.121212,
          b: 0.257576,
          c: 0.151515,
          d: 0.05303,
          e: -0.8,
          f: 0.8,
        },
      },
      {
        probability: 0.15,
        color: GREEN,
        coefficients: {
          a: 0.181818,
          b: -0.136364,
          c: 0.090909,
          d: 0.181818,
          e: 0.8,
          f: 0.5,
        },
      },
    ],
  },
  barnsley: {
    defaultView: {
      xMin: -2,
      xMax: 2,
      yMin: 0,
      yMax: 4,
    },
    parts: [
      {
        probability: 0.01,
        color: RED,
        coefficients: {
          a: 0.0,
          b: 0.0,
          c: 0.0,
          d: 0.16,
          e: 0.0,
          f: 0.01,
        },
      },
      {
        probability: 0.07,
        color: BLUE,
        coefficients: {
          a: 0.2,
          b: -0.26,
          c: 0.23,
          d: 0.22,
          e: 0.0,
          f: 1.6,
        },
      },
      {
        probability: 0.07,
        color: GREEN,
        coefficients: {
          a: -0.15,
          b: 0.28,
          c: 0.26,
          d: 0.24,
          e: 0.0,
          f: 0.44,
        },
      },
      {
        probability: 0.85,
        color: BROWN,
        coefficients: {
          a: 0.85,
          b: 0.04,
          c: -0.04,
          d: 0.85,
          e: 0.0,
          f: 1.6,
        },
      },
    ],
  },
  chaos: {
    defaultView: {
      xMin: -2,
      xMax: 2,
      yMin: 1.53,
      yMax: 5.53,
    },
    parts: [
      {
        color: randomColor(),
        probability: chaosProb,
        coefficients: {
          a: 0,
          b: 0.053,
          c: -0.429,
          d: 0,
          e: -7.083,
          f: 5.43,
        },
      },
      {
        color: randomColor(),
        probability: chaosProb,
        coefficients: {
          a: 0.143,
          b: 0,
          c: 0,
          d: -0.053,
          e: -5.619,
          f: 8.513,
        },
      },
      {
        color: randomColor(),
        probability: chaosProb,
        coefficients: {
          a: 0.143,
          b: 0,
          c: 0,
          d: 0.083,
          e: -5.619,
          f: 2.057,
        },
      },
      {
        color: randomColor(),
        probability: chaosProb,
        coefficients: {
          a: 0,
          b: 0.053,
          c: 0.429,
          d: 0,
          e: -3.952,
          f: 5.43,
        },
      },
      {
        color: randomColor(),
        probability: chaosProb,
        coefficients: {
          a: 0.119,
          b: 0,
          c: 0,
          d: 0.053,
          e: -2.555,
          f: 4.536,
        },
      },
      {
        color: randomColor(),
        probability: chaosProb,
        coefficients: {
          a: -0.0123806,
          b: -0.0649723,
          c: 0.423819,
          d: 0.00189797,
          e: -1.226,
          f: 5.235,
        },
      },
      {
        color: randomColor(),
        probability: chaosProb,
        coefficients: {
          a: 0.0852291,
          b: 0.0506328,
          c: 0.420449,
          d: 0.0156626,
          e: -0.421,
          f: 4.569,
        },
      },
      {
        color: randomColor(),
        probability: chaosProb,
        coefficients: {
          a: 0.104432,
          b: 0.00529117,
          c: 0.0570516,
          d: 0.0527352,
          e: 0.976,
          f: 8.113,
        },
      },
      {
        color: randomColor(),
        probability: chaosProb,
        coefficients: {
          a: -0.00814186,
          b: -0.0417935,
          c: 0.423922,
          d: 0.00415972,
          e: 1.934,
          f: 5.37,
        },
      },
      {
        color: randomColor(),
        probability: chaosProb,
        coefficients: {
          a: 0.093,
          b: 0,
          c: 0,
          d: 0.053,
          e: 0.861,
          f: 4.536,
        },
      },
      {
        color: randomColor(),
        probability: chaosProb,
        coefficients: {
          a: 0,
          b: 0.053,
          c: -0.429,
          d: 0,
          e: 2.447,
          f: 5.43,
        },
      },
      {
        color: randomColor(),
        probability: chaosProb,
        coefficients: {
          a: 0.119,
          b: 0,
          c: 0,
          d: -0.053,
          e: 3.363,
          f: 8.513,
        },
      },
      {
        color: randomColor(),
        probability: chaosProb,
        coefficients: {
          a: 0.119,
          b: 0,
          c: 0,
          d: 0.053,
          e: 3.363,
          f: 1.487,
        },
      },
      {
        color: randomColor(),
        probability: chaosProb,
        coefficients: {
          a: 0,
          b: 0.053,
          c: 0.429,
          d: 0,
          e: 3.972,
          f: 4.569,
        },
      },
      {
        color: randomColor(),
        probability: chaosProb,
        coefficients: {
          a: 0.123998,
          b: -0.00183957,
          c: 0.000691208,
          d: 0.0629731,
          e: 6.275,
          f: 7.716,
        },
      },
      {
        color: randomColor(),
        probability: chaosProb,
        coefficients: {
          a: 0,
          b: 0.053,
          c: 0.167,
          d: 0,
          e: 5.215,
          f: 6.483,
        },
      },
      {
        color: randomColor(),
        probability: chaosProb,
        coefficients: {
          a: 0.071,
          b: 0,
          c: 0,
          d: 0.053,
          e: 6.279,
          f: 5.298,
        },
      },
      {
        color: randomColor(),
        probability: chaosProb,
        coefficients: {
          a: 0,
          b: -0.053,
          c: -0.238,
          d: 0,
          e: 6.805,
          f: 3.714,
        },
      },
      {
        color: randomColor(),
        probability: chaosProb,
        coefficients: {
          a: -0.121,
          b: 0,
          c: 0,
          d: 0.053,
          e: 5.941,
          f: 1.487,
        },
      },
    ],
  },
  blackSpleenwort: {
    // From page 115 in Fractals Everywhere
    defaultView: {
      xMin: 0,
      xMax: 1,
      yMin: 0,
      yMax: 1,
    },
    parts: [
      {
        probability: 0.1,
        color: BROWN,
        coefficients: {
          a: 0,
          b: 0,
          c: 0,
          d: 0.16,
          e: 0,
          f: 0,
        },
      },
      {
        probability: 0.3,
        color: RED,
        coefficients: {
          a: 0.8491909883445791,
          b: 0.0370764792605356,
          c: -0.0370764792605356,
          d: 0.8491909883445791,
          e: 0,
          f: 1.6,
        },
      },
      {
        probability: 0.3,
        color: GREEN,
        coefficients: {
          a: 0.1968177086971522,
          b: -0.25660125727574246,
          c: 0.22641287406683155,
          d: 0.2230600698567725,
          e: 0,
          f: 1.6,
        },
      },
      {
        probability: 0.3,
        color: BLUE,
        coefficients: {
          a: -0.15,
          b: 0.28343644395402184,
          c: 0.2598076211353316,
          d: 0.23783141558401957,
          e: 0,
          f: 0.44,
        },
      },
    ],
  },
};
