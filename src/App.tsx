import * as React from "react";
import Canvas from "./Canvas";
import Equation from "./Equations";
import {
  eq1,
  spirals,
  randomEquation,
  randomIFSPart,
  barnsley,
  chaos,
} from "./ifs";
import { Typography, Slider } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import ControlPointIcon from "@material-ui/icons/ControlPoint";
import IconButton from "@material-ui/core/IconButton";
import { randomColor } from "./colors";
import ProbabilitiesSlider from "./ProbabilitiesSlider";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import Checkbox from "@material-ui/core/Checkbox";

function App() {
  const [currentEquation, updateEquation] = React.useState(eq1);
  const [iterations, setIterations] = React.useState(100000);

  const onIterationsSliderChange = (_: any, val: number | number[]) => {
    setIterations(val as number);
  };

  const [equationIndex, setEquationIndex] = React.useState(0);
  const equations = [eq1, spirals, barnsley, chaos];
  const handleSelectEquation = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
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
    let newEquation = currentEquation;
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
      <h1>Iterated Function System</h1>
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
      <div className="settingsAndCanvas">
        <div className="settings">
          <div className="selectAndAdd">
            <div>
              <InputLabel
                shrink
                id="demo-simple-select-placeholder-label-label"
              >
                Choose a predefined equation
              </InputLabel>
              <Select
                labelId="demo-simple-select-placeholder-label-label"
                id="demo-simple-select-placeholder-label"
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
              <IconButton onClick={onClickAdd}>
                <ControlPointIcon className="addIcon" />
              </IconButton>
            </div>
          </div>
          <ProbabilitiesSlider
            parts={currentEquation.parts}
            onUpdateProbs={onUpdateProbs}
          />
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
        </div>
        <div className="canvasContainer">
          <Canvas
            iterations={iterations}
            equation={currentEquation}
            onCanvasClick={onCanvasClick}
            showAxes={showAxes}
          ></Canvas>
        </div>
      </div>
      <div>
        <Button onClick={generateRandom} variant="contained">
          Generate random equation
        </Button>
      </div>
      <div className="inspired-by">
        Inspired by <a href="http://paulbourke.net/fractals/ifs/">this</a> post
        by Paul Bourke.
      </div>
    </>
  );
}

export default App;
