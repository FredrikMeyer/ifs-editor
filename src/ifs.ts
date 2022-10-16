import { BLUE, Color, RED } from "./colors";

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
