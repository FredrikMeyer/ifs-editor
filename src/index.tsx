import * as React from "react";
import * as ReactDOM from "react-dom";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import "./style.css";
import App from "./App";

const theme = createMuiTheme();

var mountNode = document.getElementById("app");
ReactDOM.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>,
  mountNode
);
