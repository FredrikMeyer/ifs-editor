import * as React from "react";
import { useRef, useEffect } from "react";
import { mapInterval, Point, probToIndex } from "./util";
import { IFSEquation } from "./ifs";

const WIDTH = 800;
const HEIGHT = 800;

interface CanvasOptions {
  width: number;
  height: number;
}

const canvasOptions: CanvasOptions = {
  width: WIDTH,
  height: HEIGHT,
};

class Drawer {
  private canvasOptions: CanvasOptions;

  constructor(options: CanvasOptions) {
    this.canvasOptions = options;
  }

  public toCanvasCoords(point: Point) {
    const { x, y } = point;
    const { canvasOptions } = this;
    return [
      mapInterval([-0.7, 0.8], [0, canvasOptions.width], x),
      mapInterval([-1.2, 0.5], [canvasOptions.height, 0], y),
    ];
  }
}

class IFSIterator {
  private equation: IFSEquation;
  public current: Point;

  constructor(equation: IFSEquation) {
    this.equation = equation;
    this.current = { x: 0, y: 0 };
  }

  public iterate() {
    const { x, y } = this.current;

    const r = Math.random();
    const idx = probToIndex(this.equation.probabilities, r);

    const { a, b, c, d, e, f } = this.equation.coefficients[idx];
    const nx = a * x + b * y + e;
    const ny = c * x + d * y + f;

    this.current = { x: nx, y: ny };
  }
}

function draw(
  canvas: HTMLCanvasElement,
  iterations: number,
  equation: IFSEquation
) {
  // todo: bruk window.devicePixelRatio
  canvas.width = 2 * WIDTH;
  canvas.height = 2 * HEIGHT;
  canvas.style.width = `${WIDTH}px`;
  canvas.style.height = `${HEIGHT}px`;
  const ctx = canvas.getContext("2d");

  if (!ctx) return;
  ctx.scale(2, 2);

  const drawer = new Drawer(canvasOptions);
  const iterator = new IFSIterator(equation);
  for (var i = 0; i < iterations; i++) {
    const pt = iterator.current;
    iterator.iterate();
    const [x, y] = drawer.toCanvasCoords(pt);
    ctx.rect(x, y, 0.5, 0.5);
  }
  ctx.stroke();
}

interface CanvasProps {
  iterations: number;
  equation: IFSEquation;
}

export default function Canvas(props: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      window.requestAnimationFrame(() =>
        draw(canvas, props.iterations, props.equation)
      );
    }
  }, [props]);

  return <canvas className="canvas" ref={canvasRef}></canvas>;
}
