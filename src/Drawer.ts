import { MouseEvent } from "react";
import { toRGB, toHSL } from "./colors";
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

function canvasCoordsToImageDataIndex(
  canvasWidth: number,
  x: number,
  y: number
): number {
  return y * canvasWidth + x;
}

function imageDataIndexToCoords(
  index: number,
  canvasWidth: number
): [number, number] {
  const x = index % canvasWidth;
  const y = (index - x) / canvasWidth;

  return [x, y];
}

function makeHistogram(
  drawerOptions: DrawerOptions,
  view: View,
  points: Point[]
): { histogram: number[]; max: number } {
  const histogram = new Array<number>(
    drawerOptions.width * drawerOptions.height
  );
  let max = 0;
  points.forEach(({ x, y }) => {
    const [a, b] = toCanvasCoords(drawerOptions, view, { x, y });

    const ind = canvasCoordsToImageDataIndex(drawerOptions.width, a, b);
    const curr = histogram[ind];

    if (curr > 0) {
      histogram[ind] = curr + 1;
      if (curr + 1 > max) {
        max = curr + 1;
      }
    } else {
      histogram[ind] = 1;
    }
  });

  return { histogram, max };
}

function toCanvasCoords(
  canvasOptions: DrawerOptions,
  view: View,
  point: Point
): [number, number] {
  const { x, y } = point;
  const { width, height } = canvasOptions;
  // ~~ is a faster rounding method
  // http://rocha.la/JavaScript-bitwise-operators-in-practice
  return [
    ~~(mapFromInterval(view.xMin, view.xMax, 0, width, x) + 0.5), // why add 0.5??
    ~~(mapFromInterval(view.yMin, view.yMax, height, 0, y) + 0.5),
  ];
}

function getTransformedColors(
  coloredPoints: ColoredPoint[],
  canvasOptions: DrawerOptions,
  view: View
) {
  const { max, histogram } = makeHistogram(canvasOptions, view, coloredPoints);

  const brightnesses = histogram
    .map((v) => Math.log(v) / Math.log(max))
    .map((v) => mapFromInterval(0, 1, 0.9, 0.5, v));

  const transformedColors = coloredPoints.map((c) => {
    const { color } = c;
    const hslColor = color.type !== "HSL" ? toHSL(color) : color;

    const [x, y] = toCanvasCoords(canvasOptions, view, c);
    const brightness =
      brightnesses[canvasCoordsToImageDataIndex(canvasOptions.width, x, y)];
    const newColor = toRGB({
      ...hslColor,
      lightness: brightness,
    });

    return { ...c, color: newColor };
  });

  return transformedColors;
}

export class Drawer {
  private canvasOptions: DrawerOptions;
  private view: View;

  constructor(options: DrawerOptions, view: View) {
    this.canvasOptions = options;
    this.view = view;
  }

  public draw(
    canvas: HTMLCanvasElement,
    coloredPoints: ColoredPoint[],
    mousePos: [number, number],
    showAxes: boolean,
    colorPoints: boolean
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

    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
      // alpha: false,
    });

    if (!ctx) return;
    const canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const buf = new ArrayBuffer(canvasData.data.length);
    const buf8 = new Uint8ClampedArray(buf);
    const data = new Uint32Array(buf);

    const transformedColoredPoints = colorPoints
      ? getTransformedColors(coloredPoints, this.canvasOptions, this.view)
      : coloredPoints.map((p) => {
          const { color } = p;
          return { ...p, color: color.type === "RGB" ? color : toRGB(color) };
        });

    // TODO only loop over indices that we should draw on (make histogram return them)
    for (let i = 0; i < coloredPoints.length; i++) {
      const pt = coloredPoints[i];
      const [x, y] = toCanvasCoords(this.canvasOptions, this.view, pt); // TODO: test om performance er raskere om dette flyttes ut

      if (x > WIDTH || y > HEIGHT || x < 0 || y < 0) {
        continue;
      }
      const index = canvasCoordsToImageDataIndex(WIDTH, x, y);

      const color = transformedColoredPoints[i].color;

      // See https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
      // Might give wrong result if run on a big endian processor
      data[index] =
        (255 << 24) | (color.blue << 16) | (color.green << 8) | color.red;
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
    const [a, b] = toCanvasCoords(this.canvasOptions, this.view, {
      x: 0,
      y: this.view.yMin,
    });
    const [c, d] = toCanvasCoords(this.canvasOptions, this.view, {
      x: 0,
      y: this.view.yMax,
    });
    ctx.moveTo(a, b);
    ctx.lineTo(c, d);

    const [e, f] = toCanvasCoords(this.canvasOptions, this.view, {
      x: this.view.xMin,
      y: 0,
    });
    const [g, h] = toCanvasCoords(this.canvasOptions, this.view, {
      x: this.view.xMax,
      y: 0,
    });
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
  const { it, expect, test } = import.meta.vitest;

  it("to world coords", () => {
    const options: DrawerOptions = { width: 100, height: 100 };

    const view: View = { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };

    const point = { x: 100, y: 100 };
    const res = toWorldCoords(options, view, point);

    expect(res).toStrictEqual([1, 0]);
  });

  it("world coords and back", () => {
    const options: DrawerOptions = { width: 10, height: 10 };

    const view: View = { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };

    const point = { x: 100, y: 100 };
    const [x, y] = toWorldCoords(options, view, point);

    const res = toCanvasCoords(options, view, { x, y });

    expect(res).toEqual([100, 100]);
  });

  it("from image index and back", () => {
    const ind = canvasCoordsToImageDataIndex(400, 30, 40);
    const [x, y] = imageDataIndexToCoords(ind, 400);

    expect(x).toEqual(30);
    expect(y).toEqual(40);
  });

  test.each([0, 15, 20])("image index %i and back", (i) => {
    const [x, y] = imageDataIndexToCoords(i, 10);
    const ind = canvasCoordsToImageDataIndex(10, x, y);

    expect(ind).toEqual(i);
  });

  it("ddd", () => {
    const [a, b] = toCanvasCoords(
      { width: 5, height: 5 },
      { xMin: 0, xMax: 5, yMax: 5, yMin: 0 },
      { x: 1, y: 1 }
    );

    expect([a, b]).toEqual([1, 4]);
    const ind = canvasCoordsToImageDataIndex(5, a, b);

    expect(ind).toEqual(21);
  });

  it("to canvas coords", () => {
    const p: Point = { x: 4, y: 4 };
    const [a, b] = toCanvasCoords(
      { width: 10, height: 10 },
      { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
      p
    );

    expect([a, b]).toEqual([9, 1]);
  });

  it("histogram", () => {
    const width = 10;
    const options = { width: width, height: width };
    const view = { xMin: -5, xMax: 5, yMax: -5, yMin: -5 };

    const points = [13, 6, 6, 6, 5, 23]
      .map((p) => imageDataIndexToCoords(p, width))
      .map(([x, y]) => toWorldCoords(options, view, { x, y }))
      .map(([a, b]) => ({ x: a, y: b }));

    expect(points[0]).toEqual({ x: -2, y: -5 });
    expect(points[points.length - 1]).toEqual({ x: -2, y: -5 });

    const { histogram, max } = makeHistogram(
      { width: width, height: width },
      { xMin: -5, xMax: 5, yMax: -5, yMin: -5 },
      points
    );

    expect(max).toEqual(3);

    expect(histogram.length).toEqual(width * width);

    expect(histogram[6]).toEqual(3);
  });
}
