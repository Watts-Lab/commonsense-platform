import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { store } from "./redux/store";
import { Provider } from "react-redux";
import App from "./App";
import "./css/index.css";
import './i18n'; 

ReactDOM.createRoot(document.getElementById("root") as Element).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <React.Suspense fallback="loading..."> 
          <App />
        </React.Suspense>
      </Router>
    </Provider>
  </React.StrictMode>
);
