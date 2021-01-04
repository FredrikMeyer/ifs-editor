import * as React from "react";
import Canvas from "./Canvas";
import Equation from "./Equations";
import { eq1 } from "./ifs";
import TextField from "@material-ui/core/TextField";
import { Typography, Slider } from "@material-ui/core";

function App() {
  const [equation, updateEquation] = React.useState(eq1);
  const [iterations, setIterations] = React.useState(10000);

  const onIterationsSliderChange = (_: any, val: number | number[]) => {
    setIterations(val as number);
  };

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
    </>
);
}

export default App;
