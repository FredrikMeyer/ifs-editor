import React from "react";
import { useRef } from "react";
import { ColoredPoint } from "./util";
import { View } from "./ifs";
import {
  Button,
  Slider,
  Stack,
  Box,
  Typography,
  Grid,
  IconButton,
} from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { Drawer } from "./Drawer";
import { Color } from "./colors";
import { NumberParam, useQueryParam, withDefault } from "use-query-params";

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

function useDrawer(view: View) {
  const { width, height } = useWindowSize();
  const canvasSize = React.useMemo(
    () => computeCanvasSize(width, height),
    [height, width],
  );
  const drawer = React.useMemo(
    () => new Drawer(canvasSize, view),
    [view, canvasSize],
  );

  return drawer;
}

function useViewParams(
  defaultView: View,
): readonly [View, (v: View | ((oldView: View) => View)) => void] {
  const [xMin, setMinX] = useQueryParam(
    "xMin",
    withDefault(NumberParam, defaultView.xMin),
  );
  const [xMax, setMaxX] = useQueryParam(
    "xMax",
    withDefault(NumberParam, defaultView.xMax),
  );
  const [yMin, setMinY] = useQueryParam(
    "yMin",
    withDefault(NumberParam, defaultView.yMin),
  );
  const [yMax, setMaxY] = useQueryParam(
    "yMax",
    withDefault(NumberParam, defaultView.yMax),
  );

  const setView = React.useCallback(
    (arg: View | ((oldView: View) => View)) => {
      const {
        xMax: xMaxNew,
        xMin: xMinNew,
        yMax: yMaxNew,
        yMin: yMinNew,
      } = arg instanceof Function
        ? arg({ xMin, xMax, yMax, yMin })
        : { xMax: arg.xMax, xMin: arg.xMin, yMax: arg.yMax, yMin: arg.yMin };

      setMinX(xMinNew);
      setMaxX(xMaxNew);
      setMinY(yMinNew);
      setMaxY(yMaxNew);
    },
    [setMaxX, setMinX, setMaxY, setMinY, xMax, xMin, yMin, yMax],
  );
  return [{ xMax, xMin, yMin, yMax }, setView];
}

interface CanvasProps {
  startingView: View;
  showAxes: boolean;
  useColors: boolean;
  points: ColoredPoint<Color>[];
}

export default function Canvas({
  points,
  showAxes,
  useColors,
  startingView,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useViewParams(startingView);
  const drawer = useDrawer(view as unknown as View);

  const [mousePos, setMousePos] = React.useState<[number, number]>([0, 0]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    let requestId: number | null = null;
    if (canvas) {
      requestId = window.requestAnimationFrame(() => {
        /* const startTime = performance.now(); */
        drawer.draw(canvas, points, mousePos, showAxes, useColors);
        /* const duration = performance.now() - startTime; */
      });
    }

    return () => window.cancelAnimationFrame(requestId || 0);
  }, [drawer, mousePos, points, showAxes, useColors]);

  const zoom = (factor: number, newCenter: [number, number]) => {
    const oldCenterX = 0.5 * (view.xMax + view.xMin);
    const [x, y] = newCenter;
    const diffx = x - oldCenterX;
    const newxMax = view.xMax + diffx;
    const newxMin = view.xMin + diffx;

    const oldCenterY = 0.5 * (view.yMax + view.yMin);
    const diffy = y - oldCenterY;
    const newyMax = view.yMax + diffy;
    const newyMin = view.yMin + diffy;

    const newxMaxScaled = factor * newxMax - x * factor + x;
    const newxMinScaled = factor * newxMin - x * factor + x;
    const newyMaxScaled = factor * newyMax - y * factor + y;
    const newyMinScaled = factor * newyMin - y * factor + y;

    setView({
      xMax: newxMaxScaled,
      xMin: newxMinScaled,
      yMin: newyMinScaled,
      yMax: newyMaxScaled,
    });
  };

  const zoomIn = () => {
    const centerX = 0.5 * (view.xMax + view.xMin);
    const centerY = 0.5 * (view.yMax + view.yMin);
    zoom(0.9, [centerX, centerY]);
  };

  const zoomOut = () => {
    const centerX = 0.5 * (view.xMax + view.xMin);
    const centerY = 0.5 * (view.yMax + view.yMin);
    zoom(1 / 0.9, [centerX, centerY]);
  };

  const onCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = drawer.getCursorPosition(
      canvasRef.current as HTMLCanvasElement,
      event,
    );
    const k = event.shiftKey ? 1 / 0.9 : 0.9;

    zoom(k, pos);
  };

  const onResetZoom = () => {
    setView(startingView);
  };

  const handleXSlider = (
    _: Event,
    value: number | number[],
    activeThumb: number,
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
    activeThumb: number,
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
      <Grid sx={{ position: "relative" }}>
        <div style={{ position: "absolute", right: "50px", bottom: "50px" }}>
          <div>
            <div>
              <IconButton onClick={zoomIn}>
                <ZoomInIcon />
              </IconButton>
            </div>
            <div>
              <IconButton onClick={zoomOut}>
                <ZoomOutIcon />
              </IconButton>
            </div>
          </div>
        </div>
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
      <Grid>
        <Grid container spacing={2}>
          <Grid>
            <Button onClick={onResetZoom} variant="contained">
              Reset zoom
            </Button>
          </Grid>
          <Grid>
            <Typography sx={{ padding: "4px" }}>
              Zoom by clicking. Zoom out by shift-clicking.
            </Typography>
          </Grid>
        </Grid>
        <Grid>
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
