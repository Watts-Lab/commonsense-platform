import React, { useEffect, useState } from "react";
import Option from "./Option";

import './style.css';

function QuestionThree(props) {

    const questionIdentifier = props.statementId + "question3";

    function onChangeAgreement(event) {
        props.setQuestionThreeAgree(event.target.value);
        
    }

    function onChangeOpinion(event) {
        props.setQuestionThreeOpinion(event.target.value);
        
    }

    return (
    <>
    <div className="p-3" onChange={onChangeAgreement}>
      <h4 className="font-bold">Overall, do you think this statement is an example of common sense?</h4>
      
      <ul className="grid w-full gap-2 md:grid-cols-1 py-2">
        <Option text="Yes, it is common sense" 
            id_v={questionIdentifier + "yes"} 
            statementClass={questionIdentifier + "agree"} 
            checked={props.questionThreeAgree === questionIdentifier + "yes"} 
        />
        <Option text="No, it is not common sense" 
            id_v={questionIdentifier+ "no"} 
            statementClass={questionIdentifier + "agree"} 
            checked={props.questionThreeAgree === questionIdentifier + "no"} 
        />
      </ul>
      </div>

      <div className="p-3" onChange={onChangeOpinion}>
      <h4><b>Optional:</b> How do you think most people would categorize this statement</h4>
      <ul className="grid w-full gap-2 md:grid-cols-1 py-2">
        <Option text="Clear: it is clearly written and I can understand the meaning" 
            id_v={questionIdentifier + "clear"} 
            statementClass={questionIdentifier + "opinion"} 
            checked={props.questionThreeOpinion === questionIdentifier + "clear"}  
        />
        <Option text="Confusing: I don't quite understand what it means, but it seems like it is written correctly" 
            id_v={questionIdentifier + "confusing"} 
            statementClass={questionIdentifier + "opinion"} 
            checked={props.questionThreeOpinion === questionIdentifier + "confusing"}
        />
        <Option text="Gibberish: I don't know what it means, it is gibberish or poorly written so it doesn't make sense" 
            id_v={questionIdentifier + "gibberish"} 
            statementClass={questionIdentifier + "opinion"} 
            checked={props.questionThreeOpinion === questionIdentifier + "gibberish"}
        />
      </ul>
    </div>
    </>
    )
}

export default QuestionThree;