import * as React from "react";
import { Typography, Slider } from "@material-ui/core";
import { Color, toHexString } from "./colors";
import { IFSPart } from "./ifs";

function Thumb(props: any) {
  const idx = props.oldProps["data-index"];
  const colors = props.colorChoices;
  const hexString = toHexString(colors[idx]);
  return (
    <span
      {...props.oldProps}
      style={{ ...props.oldProps.style, color: hexString }}
    />
  );
}

export default function ProbabilitiesSlider(props: {
  parts: IFSPart[];
  onUpdateProbs: (probs: number[]) => void;
}) {
  const probs = props.parts.map((p) => p.probability);
  const colors = props.parts.map((p) => p.color);
  const [value, setValue] = React.useState(probs);
  const handleChange = (_: any, newValue: number | number[]) => {
    /* setValue(newValue as number[]); */
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
        ThumbComponent={(p) => <Thumb oldProps={p} colorChoices={colors} />}
      />
    </div>
  );
}
