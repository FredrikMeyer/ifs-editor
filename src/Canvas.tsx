import * as React from "react";
import { MouseEvent } from "react";
import { useRef } from "react";
import { ColoredPoint, mapInterval, Point } from "./util";
import { IFSEquation, IFSIterator, View } from "./ifs";

interface DrawerOptions {
  width: number;
  height: number;
}

const drawerOptions: DrawerOptions = {
  width: 800,
  height: 800,
};

function toWorldCoords(
  options: DrawerOptions,
  view: View,
  point: Point
): [number, number] {
  const { x, y } = point;
  const { width, height } = options;
  const { xMin, xMax, yMax, yMin } = view;
  return [
    mapInterval([0, width], [xMin, xMax], x),
    mapInterval([height, 0], [yMin, yMax], y),
  ];
}

class Drawer {
  private canvasOptions: DrawerOptions;
  private view: View;

  constructor(options: DrawerOptions, view: View) {
    console.log("i was created");
    this.canvasOptions = options;
    this.view = view;
  }

  public toCanvasCoords(point: Point): [number, number] {
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
          [this.view.yMin, this.view.yMax],
          [canvasOptions.height, 0],
          y
        ) + 0.5
      ),
    ];
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
    const WIDTH = drawerOptions.width;
    const HEIGHT = drawerOptions.height;
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

    for (let i = 0; i < coloredPoints.length; i++) {
      const pt = coloredPoints[i];
      const { color } = coloredPoints[i];
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

    if (showAxes) {
      ctx.beginPath();
      ctx.strokeStyle = "black";
      ctx.moveTo(0.5 * canvas.width, 0);
      ctx.lineTo(0.5 * canvas.width, canvas.height);
      ctx.moveTo(0, 0.5 * canvas.height);
      ctx.lineTo(canvas.width, 0.5 * canvas.height);
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

interface CanvasProps {
  iterations: number;
  equation: IFSEquation;
  startingView: View;
  showAxes: boolean;
}

export default function Canvas({
  iterations,
  equation,
  showAxes,
  startingView,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [view, setView] = React.useState(startingView);
  const drawer = React.useMemo(() => new Drawer(drawerOptions, view), [view]);

  const points = React.useMemo(() => {
    const iterator = new IFSIterator(equation);
    return iterator.getPoints(iterations);
  }, [equation, iterations]);

  const [mousePos, setMousePos] = React.useState<[number, number]>([0, 0]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    let requestId: number | null = null;
    if (canvas) {
      requestId = window.requestAnimationFrame(() =>
        drawer.draw(canvas, points, mousePos, showAxes)
      );
    }

    return () => window.cancelAnimationFrame(requestId || 0);
  }, [drawer, mousePos, points, showAxes]);

  const onCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = drawer.getCursorPosition(
      canvasRef.current as HTMLCanvasElement,
      event
    );
    const oldCenterX = 0.5 * (view.xMax + view.xMin);
    const [x, y] = pos;
    const diffx = x - oldCenterX;
    const newxMax = view.xMax + diffx;
    const newxMin = view.xMin + diffx;

    const oldCenterY = 0.5 * (view.yMax + view.yMin);
    const diffy = y - oldCenterY;
    const newyMax = view.yMax + diffy;
    const newyMin = view.yMin + diffy;

    const k = 0.9;
    const newxMaxScaled = k * newxMax - x * k + x;
    const newxMinScaled = k * newxMin - x * k + x;
    const newyMaxScaled = k * newyMax - y * k + y;
    const newyMinScaled = k * newyMin - y * k + y;

    setView({
      xMax: newxMaxScaled,
      xMin: newxMinScaled,
      yMin: newyMinScaled,
      yMax: newyMaxScaled,
    });
  };

  return (
    <div>
      <canvas
        className="canvas"
        onClick={(event) => onCanvasClick(event)}
        onMouseMove={(e) => {
          if (canvasRef.current) {
            setMousePos(drawer.getCursorPosition(canvasRef.current, e));
          }
        }}
        ref={canvasRef}
      ></canvas>
    </div>
  );
}
