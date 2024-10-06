import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import "./css/index.css";
import "./i18n/config";
import { SessionProvider } from "./context/SessionContext";

ReactDOM.createRoot(document.getElementById("root") as Element).render(
  <React.StrictMode>
    <Router>
      <SessionProvider>
        <React.Suspense
          // notify users that active translation files are downloading during slow connections
          fallback={<div>Loading...</div>}
        >
          <App />
        </React.Suspense>
      </SessionProvider>
    </Router>
  </React.StrictMode>
);
