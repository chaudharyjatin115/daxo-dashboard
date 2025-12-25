import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { BusinessProvider } from "./context/BusinessContext";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BusinessProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BusinessProvider>
    </AuthProvider>
  </React.StrictMode>
);
