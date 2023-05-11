import React, { useEffect, useState } from "react";

import axios from "axios";

axios.defaults.baseURL = `http://localhost:8000`

import Statement from "./Statement";
import MultiStepForm from "./MultiStepForm";
import Buttons from "./Buttons";

import './style.css';

function Layout(props) {
    
    const [listOfStatements, setListOfStatements] = useState([{id: 0, statement:'loading...'}]);

    const [statementArray, setStatementArray] = useState([]);

    const [statementsData, setStatementsData] = useState([]);

    const [sessionId, setSessionId] = useState();

    const {
        steps,
        currentStepIndex,
        back,
        next
        } = MultiStepForm({steps: statementsData, sessionId: sessionId});



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

    const submitHandler = (event) => {
        event.preventDefault();
        console.log(statementsData);
    }

  return (
    <>
        <form onSubmit={submitHandler}>
            {statementArray[currentStepIndex]}

            <Buttons currentStep={currentStepIndex} next={next} back={back} />
        </form>
    </>
  )
}

export default Layout;