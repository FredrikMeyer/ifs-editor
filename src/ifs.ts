export interface IFSCoefficent {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

export interface IFSEquation {
  probabilities: number[];
  coefficients: IFSCoefficent[];
}

export const eq1: IFSEquation = {
  probabilities: [0.5, 0.5],
  coefficients: [
    {
      a: 0.202,
      b: -0.805,
      c: -0.689,
      d: -0.342,
      e: -0.373,
      f: -0.653,
    },
    {
      a: 0.138,
      b: 0.665,
      c: -0.502,
      d: -0.222,
      e: 0.66,
      f: -0.277,
    },
  ],
};

function randomIFSCoefficient(): IFSCoefficent {
  return {
    a: 2 * Math.random() - 1,
    b: 2 * Math.random() - 1,
    c: 2 * Math.random() - 1,
    d: 2 * Math.random() - 1,
    e: 2 * Math.random() - 1,
    f: 2 * Math.random() - 1,
  };
}

export function randomEquation(): IFSEquation {
  // TODO, once more than two sets of IFSCoefficents are implemented,
  // make random probabilities as well
  return {
    probabilities: [0.5, 0.5],
    coefficients: [randomIFSCoefficient(), randomIFSCoefficient()],
  };
}
