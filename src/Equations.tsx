import * as React from "react";
import { IFSEquation, IFSCoefficent } from "./ifs";
import { Slider, Typography } from "@material-ui/core";

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
  coeff: IFSCoefficent;
  index: number;
  probability: number;
  onUpdateCoefficient: (newVal: IFSCoefficent) => void;
}) {
  const { coeff, probability, index, onUpdateCoefficient } = props;

  const entries = Object.entries(coeff);

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
      <h2>Index: {index}</h2>
      <div>Probability: {probability}</div>
      {coeffs}
    </div>
  );
}

export default function Equation(props: Props) {
  const {
    equation: { probabilities },
    onUpdateEquation,
  } = props;

  const coefficientSet = props.equation.coefficients.map((co, idx) => {
    const onUpdateCoefficient = (coeff: IFSCoefficent) => {
      let newCoeffs = props.equation.coefficients;
      newCoeffs[idx] = coeff;
      onUpdateEquation({ ...props.equation, coefficients: newCoeffs });
    };
    return (
      <Coefficient
        key={idx}
        index={idx}
        probability={probabilities[idx]}
        coeff={co}
        onUpdateCoefficient={onUpdateCoefficient}
      />
    );
  });

  return <div className="coefficients">{coefficientSet}</div>;
}
