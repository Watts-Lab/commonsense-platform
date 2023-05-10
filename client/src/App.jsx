import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import axios from "axios";

axios.defaults.baseURL = `http://localhost:8000`

import Statement from "./components/Statement";
import MultiStepForm from "./components/MultiStepForm";
import Buttons from "./components/Buttons";
import Consent from "./components/Consent";
import Landing from "./components/Landing";

import './App.css';


import Cookies from 'universal-cookie';


const cookies = new Cookies();


function App() {

  const { pathname } = useLocation();

  const [listOfStatements, setListOfStatements] = useState([{id: 0, statement:'loading...'}]);

  const [statementArray, setStatementArray] = useState([]);

  const [statementsData, setStatementsData] = useState([]);

  const [sessionId, setSessionId] = useState();

  const {
    steps,
    currentStepIndex,
    back,
    next
  } = MultiStepForm({steps: statementsData});

  

  const handleStatementChange = (tid, updatedData) => {
    setStatementsData(prevState =>
      prevState.map(data => (data.id === tid ? {id: tid, answers: updatedData} : data)),
    );
  };

  useEffect(() => {
    axios.get("/statements").then((response) => {

      setStatementsData(response.data.map(statement => {
          return {id: statement.id, answers: ["", "", "", "", "", ""]}
        })
      );

      setListOfStatements(response.data);

      return response;

    }).then((response) => {

      setStatementArray(
        response.data.map((statement, index) => {
          return (
              <Statement 
              key={index}
              next={next}
              back={back}
              currentStep={index + 1}
              statementText={statement.statement} 
              statementId={statement.id} 
              onChange={handleStatementChange}
              data={statementsData[index] || {id: statement.id, answers: ["", "", "", "", "", ""]}}
            />
          )
        })
      );

    });

    axios.get("/", { withCredentials: true }).then((response) => {
      console.log(response.data);
      setSessionId(response.data)
    });

    
  }, []);

  return (
    <div className="App">
        <div className="mx-auto p-3 max-w-3xl pb-14">

          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing/>} />
              <Route path="/consent" element={<Consent/>} />
              <Route path="/statements" element={statementArray[currentStepIndex]} />

              {pathname !== "/" && pathname !== "/consent" && 
            <Buttons 
            currentStep={currentStepIndex}
            next={next}  
            back={back}  
          />
          }
            </Routes>

           
          </BrowserRouter>


          
          
    
          
        </div>

        
    </div>
  )
}

export default App;