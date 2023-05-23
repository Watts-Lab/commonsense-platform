import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import axios from "axios";

axios.defaults.baseURL = `http://localhost:8000`;

import Consent from "./components/Consent";
import Landing from "./components/Landing";
import Layout from "./components/Layout";
import Result from "./components/Result";

import "./App.css";

import Cookies from "universal-cookie";

const cookies = new Cookies();

function App() {
  return (
    <div className="App">
      <div className="mx-auto p-3 max-w-3xl pb-14">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/consent" element={<Consent />} />
            <Route path="/statements" element={<Layout />} />
            <Route path="/finish" element={<Result/>} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
