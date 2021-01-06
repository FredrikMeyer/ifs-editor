import * as React from "react";
import { IFSEquation, IFSCoefficients } from "./ifs";
import { Slider, Typography } from "@material-ui/core";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import IconButton from "@material-ui/core/IconButton";

import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

interface Props {
  equation: IFSEquation;
  onUpdateEquation: (equation: IFSEquation) => void;
}

function SingleCoefficent(props: {
  name: string;
  value: number;
  onUpdateCoeff: (newValue: number) => void;
}) {
  const handleSliderChange = (
    _: React.ChangeEvent<{}>,
    newValue: number | number[]
  ) => {
    props.onUpdateCoeff(newValue as number);
  };
  const id = `${props.name}-slider`;
  return (
    <div className="singleCoefficent">
      <Typography id={id}>{props.name}</Typography>
      <Slider
        aria-labelledby={id}
        value={props.value}
        onChange={handleSliderChange}
        min={-1}
        max={1}
        step={0.01}
      />
    </div>
  );
}

function Coefficient(props: {
  coeff: IFSCoefficients;
  index: number;
  probability: number;
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
            <IconButton onClick={props.onClickDelete} className="deleteIcon">
              <DeleteOutlinedIcon />
            </IconButton>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="equationContent">
            <div>Probability: {probability.toFixed(2)}</div>
            {coeffs}
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
      let newParts = props.equation.parts;
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

    return (
      <Coefficient
        key={idx}
        index={idx}
        probability={props.equation.parts[idx].probability}
        coeff={part.coefficients}
        onUpdateCoefficient={onUpdateCoefficient}
        onClickDelete={onClickDelete(idx)}
      />
    );
  });

  return <div className="coefficients">{coefficientSet}</div>;
}
