import * as React from "react";
import { MouseEvent } from "react";
import { useRef, useEffect } from "react";
import { mapInterval, Point, probToIndex } from "./util";
import { IFSEquation } from "./ifs";
import { Color } from "./colors";

interface CanvasOptions {
  width: number;
  height: number;
}

const canvasOptions: CanvasOptions = {
  width: 800,
  height: 800,
};

function toWorldCoords(
  options: CanvasOptions,
  equation: IFSEquation,
  point: Point
): [number, number] {
  const { x, y } = point;
  const { width, height } = options;
  const {
    view: { xMin, xMax, yMax, yMin },
  } = equation;
  return [
    mapInterval([0, width], [xMin, xMax], x),
    mapInterval([height, 0], [yMin, yMax], y),
  ];
}

class Drawer {
  private canvasOptions: CanvasOptions;
  private equation: IFSEquation;
  private showAxes: boolean;

  constructor(
    options: CanvasOptions,
    equation: IFSEquation,
    showAxes: boolean
  ) {
    this.canvasOptions = options;
    this.equation = equation;
    this.showAxes = showAxes;
  }

  public toCanvasCoords(point: Point): [number, number] {
    const { x, y } = point;
    const { canvasOptions } = this;
    // ~~ is a faster rounding method
    return [
      ~~(
        mapInterval(
          [this.equation.view.xMin, this.equation.view.xMax],
          [0, canvasOptions.width],
          x
        ) + 0.5
      ),
      ~~(
        mapInterval(
          [this.equation.view.yMin, this.equation.view.yMax],
          [canvasOptions.height, 0],
          y
        ) + 0.5
      ),
    ];
  }

  public draw(canvas: HTMLCanvasElement, iterations: number) {
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

    const iterator = new IFSIterator(this.equation);
    for (let i = 0; i < iterations; i++) {
      const pt = iterator.current;
      const color = iterator.currentColor;
      iterator.iterate();
      const [x, y] = this.toCanvasCoords(pt);

      if (i < 20) {
        continue;
      }
      // See https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
      // Might give wrong result if run on a big endian processor
      data[y * canvasData.width + x] =
        (255 << 24) | (color.blue << 16) | (color.green << 8) | color.red;
    }
    canvasData.data.set(buf8);
    ctx.putImageData(canvasData, 0, 0);

    if (this.showAxes) {
      ctx.beginPath();
      ctx.strokeStyle = "black";
      ctx.moveTo(0.5 * canvas.width, 0);
      ctx.lineTo(0.5 * canvas.width, canvas.height);
      ctx.moveTo(0, 0.5 * canvas.height);
      ctx.lineTo(canvas.width, 0.5 * canvas.height);
      ctx.stroke();
    }
  }

  public getCursorPosition(
    canvas: HTMLCanvasElement,
    event: MouseEvent<HTMLCanvasElement>
  ): [number, number] {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    return toWorldCoords(this.canvasOptions, this.equation, { x, y });
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

interface CanvasProps {
  iterations: number;
  equation: IFSEquation;
  onCanvasClick: (pos: [number, number]) => void;
  showAxes: boolean;
}

export default function Canvas({
  iterations,
  onCanvasClick,
  equation,
  showAxes,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawer = React.useMemo(
    () => new Drawer(canvasOptions, equation, showAxes),
    [equation, showAxes]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      window.requestAnimationFrame(() => drawer.draw(canvas, iterations));
    }
  }, [iterations, drawer]);

  const internallOnCanvasClick = (
    event: React.MouseEvent<HTMLCanvasElement>
  ) => {
    const pos = drawer.getCursorPosition(
      canvasRef.current as HTMLCanvasElement,
      event
    );
    onCanvasClick(pos);
  };

  return (
    <canvas
      className="canvas"
      onClick={(event) => internallOnCanvasClick(event)}
      ref={canvasRef}
    ></canvas>
  );
}
