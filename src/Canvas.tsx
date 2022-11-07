import React from "react";
import { useRef } from "react";
import { ColoredPoint } from "./util";
import { View } from "./ifs";
import { Button, Slider, Stack, Box, Typography, Grid } from "@mui/material";
import { Drawer } from "./Drawer";

function useWindowSize() {
  // From https://usehooks.com/useWindowSize/
  const [windowSize, setWindowSize] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  React.useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

function computeCanvasSize(width: number, height: number) {
  const maxWidth = width - 350;
  const maxHeight = height - 200;

  const common = Math.min(maxHeight, maxWidth);

  return { width: common, height: common };
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
  const { width, height } = useWindowSize();

  const drawer = React.useMemo(
    () => new Drawer(computeCanvasSize(width, height), view),
    [view, width, height]
  );

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
    <Grid container direction="column" sx={{ marginLeft: "10px" }}>
      <Grid item>
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
      </Grid>
      <Grid item>
        <Grid container spacing={2}>
          <Grid item>
            <Button onClick={onResetZoom} variant="contained">
              Reset zoom
            </Button>
          </Grid>
          <Grid item>
            <Typography sx={{ padding: "4px" }}>
              Zoom by clicking. Zoom out by shift-clicking.
            </Typography>
          </Grid>
        </Grid>
        <Grid item>
          <Stack direction="row" spacing={3} sx={{ mb: 1 }} alignItems="center">
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
        </Grid>
      </Grid>
    </Grid>
  );
}
