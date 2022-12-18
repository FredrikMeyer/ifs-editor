import * as React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import "./style.css";
import App from "./App";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <QueryParamProvider adapter={ReactRouter6Adapter}>
          <Routes>
            <Route path="/ifs-editor" element={<App />} />
          </Routes>
        </QueryParamProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
