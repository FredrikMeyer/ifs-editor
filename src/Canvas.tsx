import React from "react";
import { MouseEvent } from "react";
import { useRef } from "react";
import { ColoredPoint, mapInterval, Point } from "./util";
import { View } from "./ifs";
import { Button, Slider, Stack, Box, Typography } from "@mui/material";
import { toRGB } from "./colors";

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

class Drawer {
  private canvasOptions: DrawerOptions;
  private view: View;

  constructor(options: DrawerOptions, view: View) {
    this.canvasOptions = options;
    this.view = view;
  }

  public toCanvasCoords(point: Point): [number, number] {
    const { x, y } = point;
    const {
      canvasOptions: { width, height },
    } = this;
    // ~~ is a faster rounding method
    return [
      ~~(mapInterval([this.view.xMin, this.view.xMax], [0, width], x) + 0.5),
      ~~(mapInterval([this.view.yMin, this.view.yMax], [height, 0], y) + 0.5),
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
      const rgbColor = color.type === "RGB" ? color : toRGB(color);
      const [x, y] = this.toCanvasCoords(pt);

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

      data[y * canvasData.width + x] =
        (255 << 24) |
        (rgbColor.blue << 16) |
        (rgbColor.green << 8) |
        rgbColor.red;
    }
    canvasData.data.set(buf8);
    ctx.putImageData(canvasData, 0, 0);

    if (showAxes) {
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
  startingView: View;
  showAxes: boolean;
  points: ColoredPoint[];
}

export default function Canvas({
  points,
  showAxes,
  startingView,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [view, setView] = React.useState(startingView);

  React.useEffect(() => {
    setView(startingView);
  }, [startingView]);

  const drawer = React.useMemo(() => new Drawer(drawerOptions, view), [view]);

  const [mousePos, setMousePos] = React.useState<[number, number]>([0, 0]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    let requestId: number | null = null;
    if (canvas) {
      requestId = window.requestAnimationFrame(() => {
        /* const startTime = performance.now(); */
        drawer.draw(canvas, points, mousePos, showAxes);
        /* const duration = performance.now() - startTime; */
      });
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

    const k = event.shiftKey ? 1 / 0.9 : 0.9;
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

  const onResetZoom = () => {
    setView(startingView);
  };

  const handleXSlider = (
    _: Event,
    value: number | number[],
    activeThumb: number
  ) => {
    const [a, b] = value as number[];
    if (activeThumb === 0) {
      setView((oldView) => {
        const dist = oldView.xMax - oldView.xMin;

        return { ...oldView, xMin: a, xMax: a + dist };
      });
    } else {
      setView((oldView) => {
        const dist = oldView.xMax - oldView.xMin;

        return { ...oldView, xMin: b - dist, xMax: b };
      });
    }
  };

  const handleYSlider = (
    _: Event,
    value: number | number[],
    activeThumb: number
  ) => {
    const [a, b] = value as number[];
    if (activeThumb === 0) {
      setView((oldView) => {
        const dist = oldView.yMax - oldView.yMin;

        return { ...oldView, yMin: a, yMax: a + dist };
      });
    } else {
      setView((oldView) => {
        const dist = oldView.yMax - oldView.yMin;

        return { ...oldView, yMin: b - dist, yMax: b };
      });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
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
      <div>
        <div style={{ display: "flex" }}>
          <Button onClick={onResetZoom} variant="contained">
            Reset zoom
          </Button>
          <Typography sx={{ padding: "4px" }}>
            Zoom by clicking. Zoom out by shift-clicking.
          </Typography>
        </div>
        <Stack direction="row" spacing={2} sx={{ mb: 1 }} alignItems="center">
          <Box sx={{ width: "300px" }}>
            x
            <Slider
              getAriaLabel={() => "X Range"}
              value={[view.xMin, view.xMax]}
              onChange={handleXSlider}
              step={0.001}
              min={startingView.xMin}
              max={startingView.xMax}
            />
          </Box>
          <Box sx={{ width: "300px" }}>
            y
            <Slider
              getAriaLabel={() => "Y Range"}
              value={[view.yMin, view.yMax]}
              onChange={handleYSlider}
              step={0.001}
              min={startingView.yMin}
              max={startingView.yMax}
            />
          </Box>
        </Stack>
      </div>
    </div>
  );
}
