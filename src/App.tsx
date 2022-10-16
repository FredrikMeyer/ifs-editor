import * as React from "react";
import { Typography, Slider } from "@mui/material";
import Button from "@mui/material/Button";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import IconButton from "@mui/material/IconButton";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import ProbabilitiesSlider from "./ProbabilitiesSlider";
import Grid from "@mui/material/Grid";
import { randomColor } from "./colors";
import Canvas from "./Canvas";
import Equation from "./Equations";
import PrettyPrinter from "./PrettyPrinter";
import {
  eq1,
  spirals,
  randomEquation,
  randomIFSPart,
  barnsley,
  chaos,
} from "./ifs";

function App() {
  const [currentEquation, updateEquation] = React.useState(eq1);
  const [iterations, setIterations] = React.useState(100000);

  const onIterationsSliderChange = (_: Event, val: number | number[]) => {
    setIterations(val as number);
  };

  const [equationIndex, setEquationIndex] = React.useState(0);
  const equations = [eq1, spirals, barnsley, chaos];
  const handleSelectEquation = (event: SelectChangeEvent<number>) => {
    updateEquation(equations[event.target.value as number]);
    setEquationIndex(event.target.value as number);
  };

  const generateRandom = () => updateEquation(randomEquation());

  const onClickAdd = () => {
    const color = randomColor();
    const oldParts = currentEquation.parts;
    const oldProb = oldParts[currentEquation.parts.length - 1].probability;
    const newProb = oldProb * 0.5;
    const newPart = randomIFSPart(color, newProb);
    oldParts[oldParts.length - 1].probability = newProb;
    updateEquation({
      ...currentEquation,
      parts: [...currentEquation.parts, newPart],
    });
  };

  const onUpdateProbs = (newProbs: number[]) => {
    const newEquation = currentEquation;
    newProbs.forEach((p, idx) => {
      newEquation.parts[idx].probability = p;
    });

    updateEquation({
      ...newEquation,
    });
  };

  const onCanvasClick = (pos: [number, number]) => {
    const { view } = currentEquation;
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

    updateEquation({
      ...currentEquation,
      view: {
        xMax: newxMaxScaled,
        xMin: newxMinScaled,
        yMin: newyMinScaled,
        yMax: newyMaxScaled,
      },
    });
  };

  const [showAxes, setShowAxes] = React.useState(true);

  return (
    <>
      <Typography variant="h1">Iterated Function System</Typography>
      <Grid container>
        <Grid item>
          <div className="canvasContainer">
            <Canvas
              iterations={iterations}
              equation={currentEquation}
              onCanvasClick={onCanvasClick}
              showAxes={showAxes}
            ></Canvas>
          </div>
        </Grid>
        <Grid item>
          <div className="iterationsSlider">
            <Typography id="iterations-slider" gutterBottom>
              Number of iterations
            </Typography>
            <Slider
              value={iterations}
              onChange={onIterationsSliderChange}
              aria-labelledby="iterations-slider"
              min={50000}
              max={1000000}
              step={10000}
            />
            Iterations: {iterations}
          </div>
          <div className="settings">
            <div className="selectAndAdd">
              <div>
                <InputLabel shrink id="predef-label">
                  Choose a predefined equation
                </InputLabel>
                <Select
                  className="equation-selector"
                  value={equationIndex}
                  onChange={handleSelectEquation}
                >
                  <MenuItem value={0}>Mandelbrot-like</MenuItem>
                  <MenuItem value={1}>Spiral</MenuItem>
                  <MenuItem value={2}>Barnsley fern</MenuItem>
                  <MenuItem value={3}>Chaos</MenuItem>
                </Select>
              </div>
              <div>
                <IconButton onClick={onClickAdd} size="large">
                  <ControlPointIcon className="addIcon" />
                </IconButton>
              </div>
            </div>
            <Equation
              equation={currentEquation}
              onUpdateEquation={updateEquation}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showAxes}
                  onChange={(event) => setShowAxes(event.target.checked)}
                  name="checkedA"
                />
              }
              label="Show axes"
            />
            <ProbabilitiesSlider
              parts={currentEquation.parts}
              onUpdateProbs={onUpdateProbs}
            />

            <Button onClick={generateRandom} variant="contained">
              Generate random equation
            </Button>
          </div>
        </Grid>
        <Grid item>
          <PrettyPrinter equation={currentEquation} />
          <div className="inspired-by">
            Inspired by <a href="http://paulbourke.net/fractals/ifs/">this</a>{" "}
            post by Paul Bourke.
          </div>
        </Grid>
      </Grid>
    </>
  );
}

export default App;
