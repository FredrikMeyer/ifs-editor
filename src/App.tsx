import * as React from "react";
import { Typography, Slider, Link } from "@mui/material";
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
import { randomEquation, randomIFSPart } from "./ifs";
import { examples, exampleNames, Examples } from "./ifsExamples";

function App() {
  const [currentEquation, updateEquation] = React.useState(examples.eq1);
  const [iterations, setIterations] = React.useState(100000);

  const onIterationsSliderChange = (_: Event, val: number | number[]) => {
    setIterations(val as number);
  };

  const [equation, setEquation] = React.useState<Examples>(exampleNames[0]);
  const handleSelectEquation = (event: SelectChangeEvent<Examples>) => {
    updateEquation(examples[event.target.value as Examples]);
    setEquation(event.target.value as Examples);
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

  const [showAxes, setShowAxes] = React.useState(true);

  return (
    <>
      <Typography variant="h1">Iterated Function System</Typography>
      <Typography variant="body1">
        Iterated Function Systems are a type of fractals. See{" "}
        <Link href="https://en.wikipedia.org/wiki/Iterated_function_system">
          Wikipedia
        </Link>{" "}
        for references. This app was inspired by{" "}
        <Link href="http://paulbourke.net/fractals/ifs/">this</Link> post by
        Paul Bourke.
      </Typography>
      <Grid container>
        <Grid item>
          <div className="canvasContainer">
            <Canvas
              iterations={iterations}
              equation={currentEquation}
              startingView={currentEquation.defaultView}
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
                  value={equation}
                  onChange={handleSelectEquation}
                >
                  <MenuItem value={"eq1"}>Mandelbrot-like</MenuItem>
                  <MenuItem value={"spirals"}>Spiral</MenuItem>
                  <MenuItem value={"barnsley"}>Barnsley fern</MenuItem>
                  <MenuItem value={"chaos"}>Chaos</MenuItem>
                  <MenuItem value={"blackSpleenwort"}>
                    Black Spleenwort fern
                  </MenuItem>
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
        </Grid>
      </Grid>
    </>
  );
}

export default App;
