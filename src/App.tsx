import * as React from "react";
import Canvas from "./Canvas";
import Equation from "./Equations";
import { eq1, randomEquation } from "./ifs";
import { Typography, Slider } from "@material-ui/core";
import Button from "@material-ui/core/Button";

function App() {
  const [equation, updateEquation] = React.useState(eq1);
  const [iterations, setIterations] = React.useState(10000);

  const onIterationsSliderChange = (_: any, val: number | number[]) => {
    setIterations(val as number);
  };

  const generateRandom = () => updateEquation(randomEquation());

  return (
    <>
      <h1>IFS :)</h1>
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
      <Equation equation={equation} onUpdateEquation={updateEquation} />
      <div>
        <Canvas iterations={iterations} equation={equation}></Canvas>
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
