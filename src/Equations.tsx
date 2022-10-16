import * as React from "react";
import { IFSEquation, IFSCoefficients } from "./ifs";
import { Slider, Typography } from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Input from "@mui/material/Input";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { HexColorPicker } from "react-colorful";
import { Color, hexToColor, toHexString, RED } from "./colors";

interface Props {
  equation: IFSEquation;
  onUpdateEquation: (equation: IFSEquation) => void;
}

function SingleCoefficent(props: {
  name: string;
  value: number;
  onUpdateCoeff: (newValue: number) => void;
}) {
  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    props.onUpdateCoeff(newValue as number);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.onUpdateCoeff(Number(event.target.value));
  };

  const id = `${props.name}-slider`;
  return (
    <div className="singleCoefficent">
      <Grid container spacing={2} alignItems="center">
        <Grid item xs>
          <Typography id={id}>{props.name}</Typography>
          <Slider
            aria-labelledby={id}
            value={props.value}
            onChange={handleSliderChange}
            min={-1}
            max={1}
            step={0.01}
          />
        </Grid>
        <Grid item>
          <Input
            style={{ width: "100px" }}
            value={props.value}
            onChange={handleInputChange}
            inputProps={{
              step: 0.01,
              min: 0,
              max: 1,
              type: "number",
            }}
          />
        </Grid>
      </Grid>
    </div>
  );
}

function Coefficient(props: {
  coeff: IFSCoefficients;
  index: number;
  probability: number;
  color: Color;
  setColor: (color: Color) => void;
  onUpdateCoefficient: (newVal: IFSCoefficients) => void;
  onClickDelete: () => void;
}) {
  const { coeff, probability, index, onUpdateCoefficient } = props;

  const entries = Object.entries(props.coeff);

  const coeffs = entries.map((e) => (
    <SingleCoefficent
      key={e[0]}
      name={e[0]}
      value={e[1]}
      onUpdateCoeff={(newVal: number) =>
        onUpdateCoefficient({ ...coeff, [e[0]]: newVal })
      }
    />
  ));

  return (
    <div className="coefficientSet">
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <div className="equationHeader">
            <h2>Index: {index}</h2>
            <IconButton
              onClick={props.onClickDelete}
              className="deleteIcon"
              size="large"
            >
              <DeleteOutlinedIcon />
            </IconButton>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="equationContent">
            <div>Probability: {probability.toFixed(2)}</div>
            {coeffs}
          </div>
          <div>
            <HexColorPicker
              color={toHexString(props.color)}
              onChange={(v) => props.setColor(hexToColor(v) || RED)}
            />
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default function Equation(props: Props) {
  const { equation, onUpdateEquation } = props;

  const coefficientSet = equation.parts.map((part, idx) => {
    const onUpdateCoefficient = (newCoeffs: IFSCoefficients) => {
      const newParts = props.equation.parts;
      newParts[idx] = {
        probability: props.equation.parts[idx].probability,
        coefficients: newCoeffs,
        color: props.equation.parts[idx].color,
      };
      onUpdateEquation({ ...props.equation, parts: newParts });
    };

    const onClickDelete = (index: number) => () => {
      const oldProb = props.equation.parts[index].probability;

      const copiedParts = props.equation.parts.slice(0);
      copiedParts.splice(index, 1);
      copiedParts[0].probability += oldProb;

      onUpdateEquation({
        ...props.equation,
        parts: copiedParts,
      });
    };

    const updateColor = (color: Color) => {
      const newParts = props.equation.parts;
      newParts[idx] = {
        ...props.equation.parts[idx],
        color: color,
      };
      console.log("called");
      onUpdateEquation({ ...props.equation, parts: newParts });
    };

    return (
      <Coefficient
        key={idx}
        index={idx}
        color={props.equation.parts[idx].color}
        setColor={updateColor}
        probability={props.equation.parts[idx].probability}
        coeff={part.coefficients}
        onUpdateCoefficient={onUpdateCoefficient}
        onClickDelete={onClickDelete(idx)}
      />
    );
  });

  return <div className="coefficients">{coefficientSet}</div>;
}
