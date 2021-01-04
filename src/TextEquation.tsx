import * as React from "react";
import { IFSEquation } from './ifs';

function TextEquation(props: {equation: IFSEquation}) {
  const { equation } = props;
  return (
    <div>
        <div>
            x<sub>n+1</sub>
        </div>
    </div>
  )
}
