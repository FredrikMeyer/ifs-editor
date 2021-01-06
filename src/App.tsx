import * as React from "react";
import Canvas from "./Canvas";
import Equation from "./Equations";
import { eq1, eq2, randomEquation, randomIFSPart } from "./ifs";
import { Typography, Slider } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import ControlPointIcon from "@material-ui/icons/ControlPoint";
import IconButton from "@material-ui/core/IconButton";
import { randomColor } from "./colors";
import ProbabilitiesSlider from "./ProbabilitiesSlider";

function App() {
  const [equation, updateEquation] = React.useState(eq1);
  const [iterations, setIterations] = React.useState(50000);

  const onIterationsSliderChange = (_: any, val: number | number[]) => {
    setIterations(val as number);
  };

  const [equationIndex, setEquationIndex] = React.useState(0);
  const equations = [eq1, eq2];
  const handleSelectEquation = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    updateEquation(equations[event.target.value as number]);
    setEquationIndex(event.target.value as number);
  };

  const generateRandom = () => updateEquation(randomEquation());

  const onClickAdd = () => {
    const color = randomColor();
    const oldParts = equation.parts;
    const oldProb = oldParts[equation.parts.length - 1].probability;
    const newProb = oldProb * 0.5;
    const newPart = randomIFSPart(color, newProb);
    oldParts[oldParts.length - 1].probability = newProb;
    updateEquation({
      ...equation,
      parts: [...equation.parts, newPart],
    });
  };

  const onUpdateProbs = (newProbs: number[]) => {
    let newEquation = equation;
    newProbs.forEach((p, idx) => {
      newEquation.parts[idx].probability = p;
    });

    updateEquation({
      ...newEquation,
    });
  };

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
          max={100000}
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
              </Select>
            </div>
            <div>
              <IconButton onClick={onClickAdd}>
                <ControlPointIcon className="addIcon" />
              </IconButton>
            </div>
          </div>
          <ProbabilitiesSlider
            parts={equation.parts}
            onUpdateProbs={onUpdateProbs}
          />
          <Equation equation={equation} onUpdateEquation={updateEquation} />
        </div>
        <div className="canvasContainer">
          <Canvas iterations={iterations} equation={equation}></Canvas>
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
