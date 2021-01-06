import { BLUE, Color, GREEN, RED } from "./colors";

export interface IFSCoefficients {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

export interface IFSPart {
  color: Color;
  probability: number;
  coefficients: IFSCoefficients;
}

export interface View {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface IFSEquation {
  view: View;
  parts: IFSPart[];
}

export const eq1: IFSEquation = {
  view: {
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
};

export const eq2: IFSEquation = {
  view: {
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
};

export function randomIFSPart(color: Color, probability: number): IFSPart {
  return {
    probability,
    color: color,
    coefficients: {
      a: 2 * Math.random() - 1,
      b: 2 * Math.random() - 1,
      c: 2 * Math.random() - 1,
      d: 2 * Math.random() - 1,
      e: 2 * Math.random() - 1,
      f: 2 * Math.random() - 1,
    },
  };
}

export function randomEquation(): IFSEquation {
  // TODO, once more than two sets of IFSCoefficents are implemented,
  // make random probabilities as well
  return {
    view: {
      xMin: -1,
      xMax: 1,
      yMin: -1,
      yMax: 1,
    },
    parts: [randomIFSPart(RED, 0.5), randomIFSPart(BLUE, 0.5)],
  };
}
