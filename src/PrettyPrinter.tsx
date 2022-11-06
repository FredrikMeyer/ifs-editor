import React from "react";
import katex from "katex";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { IFSEquation, IFSPart } from "./ifs";
interface Props {
  equation: IFSEquation;
}

function partToLatexString(part: IFSPart) {
  const { a, b, c, d, e, f } = part.coefficients;
  return `\\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d}\\end{pmatrix} x + \\begin{pmatrix} ${e} \\\\ ${f} \\end{pmatrix}`;
}

function PrettyPart(props: { index: number; part: IFSPart }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const div = ref.current;
    const s = `f_${props.index}(x)=` + partToLatexString(props.part);
    katex.render(s, div as HTMLDivElement);
  });
  return <div ref={ref}></div>;
}

function LatexPrinter(props: Props) {
  const { parts } = props.equation;
  return (
    <div>
      {parts.map((part, idx) => (
        <PrettyPart key={idx} part={part} index={idx} />
      ))}
    </div>
  );
}

export default function PrettyPrinter(props: Props) {
  const [latex, setShowLatex] = React.useState(true);
  const handleCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowLatex(event.target.checked);
  };

  return (
    <div>
      <FormControlLabel
        control={<Switch checked={latex} onChange={handleCheckbox} />}
        label="Show LaTex"
      />
      {latex ? (
        <LatexPrinter {...props} />
      ) : (
        <pre>{JSON.stringify(props.equation, undefined, 2)}</pre>
      )}
    </div>
  );
}
