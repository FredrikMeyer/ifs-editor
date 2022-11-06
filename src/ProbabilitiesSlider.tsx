import React from "react";
import { Slider } from "@mui/material";
import { IFSPart } from "./ifs";

export default function ProbabilitiesSlider(props: {
  parts: IFSPart[];
  onUpdateProbs: (probs: number[]) => void;
}) {
  const probs = props.parts.map((p) => p.probability);
  const handleChange = (_: Event, newValue: number | number[]) => {
    props.onUpdateProbs(newValue as number[]);
  };
  return (
    <div>
      <Slider
        valueLabelDisplay="auto"
        value={probs}
        min={0}
        max={1}
        step={0.01}
        onChange={handleChange}
      />
    </div>
  );
}
