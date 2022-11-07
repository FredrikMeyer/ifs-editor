import { MouseEvent } from "react";
import { toRGB } from "./colors";
import { View } from "./ifs";
import { ColoredPoint, mapFromInterval, Point } from "./util";

interface DrawerOptions {
  width: number;
  height: number;
}

function toWorldCoords(
  options: DrawerOptions,
  view: View,
  point: Point
): [number, number] {
  const { x, y } = point;
  const { width, height } = options;
  const { xMin, xMax, yMax, yMin } = view;
  return [
    mapFromInterval(0, width, xMin, xMax, x),
    mapFromInterval(height, 0, yMin, yMax, y),
  ];
}

export class Drawer {
  private canvasOptions: DrawerOptions;
  private view: View;

  constructor(options: DrawerOptions, view: View) {
    this.canvasOptions = options;
    this.view = view;
  }

  private toCanvasCoords(point: Point): [number, number] {
    const { x, y } = point;
    const {
      canvasOptions: { width, height },
    } = this;
    // ~~ is a faster rounding method
    // http://rocha.la/JavaScript-bitwise-operators-in-practice
    return [
      ~~(mapFromInterval(this.view.xMin, this.view.xMax, 0, width, x) + 0.5),
      ~~(mapFromInterval(this.view.yMin, this.view.yMax, height, 0, y) + 0.5),
    ];
  }

  private canvasCoordsToImageDataIndex(x: number, y: number): number {
    return y * this.canvasOptions.width + x;
  }

  public draw(
    canvas: HTMLCanvasElement,
    coloredPoints: ColoredPoint[],
    mousePos: [number, number],
    showAxes: boolean
  ) {
    // todo: bruk window.devicePixelRatio
    /* canvas.width = 2 * WIDTH; */
    /* canvas.height = 2 * HEIGHT; */
    const WIDTH = this.canvasOptions.width;
    const HEIGHT = this.canvasOptions.height;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.width = `${WIDTH}px`;
    canvas.style.height = `${HEIGHT}px`;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) return;
    const canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const buf = new ArrayBuffer(canvasData.data.length);
    const buf8 = new Uint8ClampedArray(buf);
    const data = new Uint32Array(buf);

    /* const temp = coloredPoints.map((p) => this.toCanvasCoords(p)); */
    /* console.log(temp); */
    // TODO: move conversion to canvas coords to before draw loop
    // then the computed points can be modified by duplicates
    // to be able to color

    for (let i = 0; i < coloredPoints.length; i++) {
      const pt = coloredPoints[i];
      const { color } = coloredPoints[i];
      const rgbColor = color.type === "RGB" ? color : toRGB(color);
      const [x, y] = this.toCanvasCoords(pt); // TODO: test om performance er raskere om dette flyttes ut

      if (
        x > this.canvasOptions.width ||
        y > this.canvasOptions.height ||
        x < 0 ||
        y < 0
      ) {
        continue;
      }

      // See https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
      // Might give wrong result if run on a big endian processor

      data[this.canvasCoordsToImageDataIndex(x, y)] =
        (255 << 24) |
        (rgbColor.blue << 16) |
        (rgbColor.green << 8) |
        rgbColor.red;
    }
    canvasData.data.set(buf8);
    ctx.putImageData(canvasData, 0, 0);

    if (showAxes) {
      this.drawAxes(ctx, mousePos);
    }
  }

  private drawAxes(ctx: CanvasRenderingContext2D, mousePos: [number, number]) {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    const [a, b] = this.toCanvasCoords({ x: 0, y: this.view.yMin });
    const [c, d] = this.toCanvasCoords({ x: 0, y: this.view.yMax });
    ctx.moveTo(a, b);
    ctx.lineTo(c, d);

    const [e, f] = this.toCanvasCoords({ x: this.view.xMin, y: 0 });
    const [g, h] = this.toCanvasCoords({ x: this.view.xMax, y: 0 });
    ctx.moveTo(e, f);
    ctx.lineTo(g, h);
    ctx.stroke();

    ctx.font = "16px serif";
    const { xMax, xMin, yMin, yMax } = this.view;
    ctx.fillText(`x: [${xMin.toFixed(2)}, ${xMax.toFixed(2)}]`, 10, 40);
    ctx.fillText(`y: [${yMin.toFixed(2)}, ${yMax.toFixed(2)}]`, 10, 60);

    ctx.fillText(
      `[x,y]: [${mousePos[0].toFixed(2)}, ${mousePos[1].toFixed(2)}]`,
      10,
      80
    );
  }

  public getCursorPosition(
    canvas: HTMLCanvasElement,
    event: MouseEvent<HTMLCanvasElement>
  ): [number, number] {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    return toWorldCoords(this.canvasOptions, this.view, { x, y });
  }
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("works", () => {
    const options: DrawerOptions = { width: 100, height: 100 };

    const view: View = { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };

    const point = { x: 100, y: 100 };
    const res = toWorldCoords(options, view, point);

    expect(res).toStrictEqual([1, 0]);
  });
}
