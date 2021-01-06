import * as React from "react";
import { useRef, useEffect } from "react";
import { mapInterval, Point, probToIndex } from "./util";
import { IFSEquation, View } from "./ifs";
import { Color } from "./colors";

interface CanvasOptions {
  width: number;
  height: number;
}

const canvasOptions: CanvasOptions = {
  width: 800,
  height: 800,
};

class Drawer {
  private canvasOptions: CanvasOptions;
  private view: View;

  constructor(options: CanvasOptions, view: View) {
    this.canvasOptions = options;
    this.view = view;
  }

  public toCanvasCoords(point: Point) {
    const { x, y } = point;
    const { canvasOptions } = this;
    // ~~ is a faster rounding method
    return [
      ~~(
        mapInterval(
          [this.view.xMin, this.view.xMax],
          [0, canvasOptions.width],
          x
        ) + 0.5
      ),
      ~~(
        mapInterval(
          [this.view.yMax, this.view.yMin],
          [canvasOptions.height, 0],
          y
        ) + 0.5
      ),
    ];
  }
}

class IFSIterator {
  private equation: IFSEquation;
  private probabilites: number[];
  public current: Point;
  public currentColor: Color;

  constructor(equation: IFSEquation) {
    this.equation = equation;
    this.probabilites = equation.parts.map((p) => p.probability);
    this.current = { x: Math.random(), y: Math.random() };
    this.currentColor = { red: 255, blue: 0, green: 0 };
  }

  public iterate() {
    const { x, y } = this.current;

    const r = Math.random();
    const idx = probToIndex(this.probabilites, r);

    const { a, b, c, d, e, f } = this.equation.parts[idx].coefficients;
    const nx = a * x + b * y + e;
    const ny = c * x + d * y + f;

    this.current = { x: nx, y: ny };
    this.currentColor = this.equation.parts[idx].color;
  }
}

function draw(
  canvas: HTMLCanvasElement,
  iterations: number,
  equation: IFSEquation
) {
  // todo: bruk window.devicePixelRatio
  /* canvas.width = 2 * WIDTH; */
  /* canvas.height = 2 * HEIGHT; */
  const WIDTH = canvasOptions.width;
  const HEIGHT = canvasOptions.height;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas.style.width = `${WIDTH}px`;
  canvas.style.height = `${HEIGHT}px`;
  const ctx = canvas.getContext("2d");

  if (!ctx) return;
  const canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const buf = new ArrayBuffer(canvasData.data.length);
  const buf8 = new Uint8ClampedArray(buf);
  const data = new Uint32Array(buf);

  const drawer = new Drawer(canvasOptions, equation.view);
  const iterator = new IFSIterator(equation);
  for (var i = 0; i < iterations; i++) {
    const pt = iterator.current;
    const color = iterator.currentColor;
    iterator.iterate();
    const [x, y] = drawer.toCanvasCoords(pt);

    // See https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
    // Might give wrong result if run on a big endian processor
    data[y * canvasData.width + x] =
      (255 << 24) | (color.blue << 16) | (color.green << 8) | color.red;
  }
  canvasData.data.set(buf8);
  ctx.putImageData(canvasData, 0, 0);
  /*
   *   ctx.beginPath();
   *   ctx.strokeStyle = "black";
   *   ctx.moveTo(0.5 * canvas.width, 0);
   *   ctx.lineTo(0.5 * canvas.width, canvas.height);
   *   ctx.moveTo(0, 0.5 * canvas.height);
   *   ctx.lineTo(canvas.width, 0.5 * canvas.height);
   *   console.log(ctx.strokeStyle);
   *   ctx.stroke(); */
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
