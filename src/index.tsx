import * as React from "react";
import { createRoot } from "react-dom/client";
import {
  ThemeProvider,
  StyledEngineProvider,
  createTheme,
} from "@mui/material/styles";
import "./style.css";
import App from "./App";

const theme = createTheme({
  components: {
    MuiTypography: {
      styleOverrides: {
        h1: {
          fontSize: "3rem",
        },
      },
    },
  },
});

const mountNode = document.getElementById("app");

if (mountNode) {
  const root = createRoot(mountNode);

  root.render(
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
