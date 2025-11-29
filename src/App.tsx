import React from "react";
import { FaGithubSquare } from "react-icons/fa";
import { Typography, Slider, Link, AppBar, Toolbar, Box } from "@mui/material";
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
  IFSEquation,
  IFSIterator,
  randomEquation,
  randomIFSPart,
  variations,
} from "./ifs";
import { examples, exampleNames, Examples } from "./ifsExamples";
import {
  BooleanParam,
  createEnumParam,
  useQueryParam,
  withDefault,
} from "use-query-params";

const EqParam = withDefault(
  createEnumParam<Examples>([...exampleNames]),
  exampleNames[0],
);

const VariationParam = withDefault(
  createEnumParam<Variations | "None">(
    Object.keys(variations) as unknown as Variations[],
  ),
  "None",
);

const ShowAxesParam = withDefault(BooleanParam, true);
const ColorPointsParam = withDefault(BooleanParam, false);

type Variations = keyof typeof variations;

function App() {
  const [iterations, setIterations] = React.useState(100_000);

  const onIterationsSliderChange = (_: Event, val: number | number[]) => {
    setIterations(val as number);
  };

  const [equationName, setEquationName] = useQueryParam("eqName", EqParam);
  const [variation, setVariation] = useQueryParam("variation", VariationParam);
  const variationNonNull = variation === null ? undefined : variation;

  const [equationChoice, setEquationChoice] = React.useState<{
    equation: IFSEquation;
  }>({
    equation:
      variation && variation !== "None"
        ? { ...examples[equationName], variation: variations[variation] }
        : examples[equationName],
  });

  const handleSelectEquation = (event: SelectChangeEvent<Examples>) => {
    setEquationName(event.target.value);
    setEquationChoice((old) => ({
      ...old,
      equation: examples[event.target.value],
    }));
  };

  const handleSelectVariation = (
    event: SelectChangeEvent<keyof typeof variations | "None">,
  ) => {
    const val = event.target.value;

    setVariation(val);
    setEquationChoice((old) => ({
      ...old,
      equation:
        val === "None"
          ? { ...old.equation, variation: undefined }
          : { ...old.equation, variation: variations[val] },
    }));
  };

  const generateRandom = () =>
    setEquationChoice((old) => ({ ...old, equation: randomEquation() }));

  const onClickAdd = () => {
    const color = randomColor();
    const oldParts = equationChoice.equation.parts;
    const oldProb =
      oldParts[equationChoice.equation.parts.length - 1].probability;
    const newProb = oldProb * 0.5;
    const newPart = randomIFSPart(color, newProb);
    oldParts[oldParts.length - 1].probability = newProb;
    setEquationChoice((old) => ({
      ...old,
      equation: {
        ...old.equation,
        parts: [...old.equation.parts, newPart],
      },
    }));
  };

  const onUpdateProbs = (newProbs: number[]) => {
    const newEquation = { ...equationChoice.equation };
    newProbs.forEach((p, idx) => {
      newEquation.parts[idx].probability = p;
    });

    setEquationChoice((old) => ({
      ...old,
      equation: newEquation,
    }));
  };

  const points = React.useMemo(() => {
    const iterator = new IFSIterator(equationChoice.equation);
    return iterator.getPoints(iterations);
  }, [equationChoice.equation, iterations]);

  const [showAxes, setShowAxes] = useQueryParam("eqName", ShowAxesParam);
  const [colorPoints, setColorPoints] = useQueryParam(
    "colorPoints",
    ColorPointsParam,
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h1" sx={{ flexGrow: 1 }}>
            Iterated Function System
          </Typography>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            sx={{ mr: 2 }}
            href={`https://github.com/FredrikMeyer/ifs-editor/commit/${__COMMIT_HASH__}`}
          >
            <FaGithubSquare />
          </IconButton>
        </Toolbar>
      </AppBar>
      <main>
        <Grid container justifyContent="space-between" spacing={2}>
          <Grid size="auto">
            <Canvas
              points={points}
              startingView={equationChoice.equation.defaultView}
              useColors={colorPoints}
              showAxes={showAxes}
            ></Canvas>
          </Grid>
          <Grid size="grow">
            <div style={{ padding: "5px" }}>
              Iterated Function Systems are a type of fractals. See{" "}
              <Link href="https://en.wikipedia.org/wiki/Iterated_function_system">
                Wikipedia
              </Link>{" "}
              for references. This app was inspired by{" "}
              <Link href="http://paulbourke.net/fractals/ifs/">this</Link> post
              by Paul Bourke.
            </div>
            <div className="iterationsSlider">
              <Typography id="iterations-slider" gutterBottom>
                Number of iterations
              </Typography>
              <Slider
                value={iterations}
                onChange={onIterationsSliderChange}
                aria-labelledby="iterations-slider"
                min={50_000}
                max={500_000}
                step={10_000}
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
                    labelId="predef-label"
                    value={equationName}
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
                <div style={{ alignSelf: "center" }}>
                  <IconButton onClick={onClickAdd} size="large">
                    <ControlPointIcon className="addIcon" />
                  </IconButton>
                </div>
              </div>
              <div>
                <InputLabel shrink id="variation-label">
                  Variation
                </InputLabel>
                <Select
                  value={variationNonNull}
                  onChange={handleSelectVariation}
                  labelId="variation-label"
                  renderValue={(v) => (
                    <span style={{ textTransform: "capitalize" }}>{v}</span>
                  )}
                >
                  <MenuItem value={"None"}>None</MenuItem>
                  {Object.keys(variations).map((v) => {
                    return (
                      <MenuItem
                        value={v}
                        key={v}
                        style={{ textTransform: "capitalize" }}
                      >
                        {v}
                      </MenuItem>
                    );
                  })}
                </Select>
              </div>
              <Equation
                equation={equationChoice.equation}
                onUpdateEquation={(newEq: IFSEquation) =>
                  setEquationChoice((old) => ({ ...old, equation: newEq }))
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showAxes}
                    onChange={(event) => setShowAxes(event.target.checked)}
                  />
                }
                label="Show axes"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={colorPoints}
                    onChange={(event) => setColorPoints(event.target.checked)}
                  />
                }
                label="Color points"
              />
              <ProbabilitiesSlider
                parts={equationChoice.equation.parts}
                onUpdateProbs={onUpdateProbs}
              />

              <Button onClick={generateRandom} variant="contained">
                Generate random equation
              </Button>
            </div>
            <PrettyPrinter equation={equationChoice.equation} />
          </Grid>
        </Grid>
      </main>
    </Box>
  );
}

export default App;
