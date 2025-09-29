import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./css/index.css";
import "./i18n/config";
import { SessionProvider } from "./context/SessionContext";

ReactDOM.createRoot(document.getElementById("root") as Element).render(
  // <React.StrictMode>
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
    <SessionProvider>
      <React.Suspense
        // notify users that active translation files are downloading during slow connections
        fallback={<div>Loading...</div>}
      >
        <App />
      </React.Suspense>
    </SessionProvider>
  </BrowserRouter>
  // </React.StrictMode>
);
