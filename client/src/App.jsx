import React, { useEffect, useState } from "react";
import axios from "axios";

axios.defaults.baseURL = `http://localhost:8000`

import Statement from "./components/Statement";
import MultiStepForm from "./components/MultiStepForm";
import Buttons from "./components/Buttons";

import './App.css';


import Cookies from 'universal-cookie';


const cookies = new Cookies();


function App() {

  const [listOfStatements, setListOfStatements] = useState([{id: 0, statement:'loading...'}]);

  const [statementArray, setStatementArray] = useState([]);

  const [statementsData, setStatementsData] = useState([]);

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

    axios.get("", { withCredentials: true }).then((response) => {
      console.log(response.data);
    });

  }, []);

  return (
    <div className="App">
        <div className="mx-auto p-3 max-w-3xl pb-14">
          { 
            statementArray[currentStepIndex]
          }

          {
            console.log('cookie: %O', document.cookie)
          }
          <Buttons 
            currentStep={currentStepIndex}
            next={next}  
            back={back}  
          />
    

        
        {/* <Statement 
            next={next}
            back={back}
            currentStep={currentStepIndex + 1}
            statementText={listOfStatements[currentStepIndex].statement} 
            statementId={listOfStatements[currentStepIndex].id} 
          /> */}

        </div>
    </div>
  )
}

export default App;