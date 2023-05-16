import React, { useEffect, useState } from "react";

import axios from "axios";

axios.defaults.baseURL = `http://localhost:8000`

import Statement from "./Statement";
import MultiStepForm from "./MultiStepForm";
import Buttons from "./Buttons";

import './style.css';

function Layout(props) {
    
    // const [listOfStatements, setListOfStatements] = useState([{id: 0, statement:'loading...'}]);

    const [statementArray, setStatementArray] = useState([]);

    const [statementsData, setStatementsData] = useState([]);

    const [sessionId, setSessionId] = useState();

    const handleAnswerSaving = (tid, answerState) => {
        setStatementsData(prevState =>
            prevState.map(data => (data.id === tid ? {id: tid, answers: data.answers, answereSaved: answerState} : data)),
        );
    };

    const getNextStatement = async (sessionId) => {
        try {
          const {data:response} = await axios.get("/statements/next") //use data destructuring to get data from the promise object
            return response
        } catch (error) {
            console.log(error);
        }
    }

    const pushNewStatement = (statementId, statementText, statementIndex) => {
        console.log('adding new statement');
        setStatementsData(oldArray => [...oldArray, {id: statementId, answers: ["", "", "", "", "", ""], answereSaved: false}] );
        setStatementArray(
            oldArray => [...oldArray, 
            (
                <Statement 
                    key={oldArray.length}
                    next={next}
                    back={back}
                    currentStep={oldArray.length + 1}
                    statementText={statementText} 
                    statementId={statementId} 
                    onChange={handleStatementChange}
                    onSaveStatement={handleAnswerSaving}
                    data={statementsData[oldArray.length] || {id: statementId, answers: ["", "", "", "", "", ""]}}
                />
            )]
        );
    }

    const {
        steps,
        currentStepIndex,
        back,
        next
        } = MultiStepForm({
            steps: statementsData, 
            sessionId: sessionId, 
            handleAnswerSaving: handleAnswerSaving, 
            getNextStatement: getNextStatement,
            pushNewStatement: pushNewStatement
        });


    const handleStatementChange = (tid, updatedData) => {
        setStatementsData(prevState =>
            prevState.map(data => (data.id === tid ? {id: tid, answers: updatedData, answereSaved: data.answereSaved} : data)),
        );
    };

    const getUserLastAnswer = (sessionId, statementId) => {
        axios.get("/answers/session/"+sessionId+"/statement/" + statementId).then((response) => {
            console.log(response.data)
        })
    };

    useEffect(() => {

        axios.get("/statements").then((response) => {

            setStatementsData(response.data.map(statement => {
                    return {id: statement.id, answers: ["", "", "", "", "", ""], answereSaved: false}
                })
            );

            // setListOfStatements(response.data);

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
                        onSaveStatement={handleAnswerSaving}
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

            <Buttons currentStep={currentStepIndex} getNextStatement={getNextStatement} next={next} back={back} />
        </form>
    </>
  )
}

export default Layout;