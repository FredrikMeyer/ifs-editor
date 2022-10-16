import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  ThemeProvider,
  StyledEngineProvider,
  createTheme,
} from "@mui/material/styles";
import "./style.css";
import App from "./App";

const theme = createTheme();

const mountNode = document.getElementById("app");
ReactDOM.render(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StyledEngineProvider>,
  mountNode
);
