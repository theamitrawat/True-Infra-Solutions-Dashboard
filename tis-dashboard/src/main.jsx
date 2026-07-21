import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

// basename must match the `base` value in vite.config.js and your GitHub repo name.
// GitHub Pages: https://<username>.github.io/tis-dashboard/
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename="/tis-dashboard">
      <App />
    </BrowserRouter>
  </StrictMode>
);