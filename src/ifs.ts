import { BLUE, Color, RED } from "./colors";
import { ColoredPoint, probToIndex } from "./util";

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
  defaultView: View;
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
    defaultView: {
      xMin: -1,
      xMax: 1,
      yMin: -1,
      yMax: 1,
    },
    parts: [randomIFSPart(RED, 0.5), randomIFSPart(BLUE, 0.5)],
  };
}

export class IFSIterator {
  private equation: IFSEquation;
  private probabilites: number[];

  constructor(equation: IFSEquation) {
    this.equation = equation;
    this.probabilites = equation.parts.map((p) => p.probability);
  }

  private iterate(prev: ColoredPoint): ColoredPoint {
    const { x, y } = prev;

    const r = Math.random();
    const idx = probToIndex(this.probabilites, r);

    const { a, b, c, d, e, f } = this.equation.parts[idx].coefficients;
    const nx = a * x + b * y + e;
    const ny = c * x + d * y + f;

    // const newColor = brightenColor(this.equation.parts[idx].color, iterationN);

    return {
      x: nx,
      y: ny,
      color: this.equation.parts[idx].color,
    };
  }

  public getPoints(iterations: number): ColoredPoint[] {
    const res: ColoredPoint[] = [
      {
        x: Math.random(),
        y: Math.random(),
        color: RED,
      },
    ];
    // Avoid random points by starting at i=20
    for (let i = 20; i < iterations; i++) {
      res.push(this.iterate(res[res.length - 1]));
    }
    return res;
  }
}
