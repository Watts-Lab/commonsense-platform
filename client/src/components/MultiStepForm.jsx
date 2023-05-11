import React, { useEffect, useState } from "react";
import axios from "axios";

import './style.css';


function MultiStepForm(props) {

    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    function checkAnswers(answerList) {
        if(answerList.includes('')) {
            return false;
        } else {
            return true;
        }
    }

    function whichQuestion(answerList) {
        if(answerList.includes('')) {
            return answerList.indexOf('');
        } else {
            return null;
        }
    }

    function next() {

        if(checkAnswers(props.steps[currentStepIndex].answers.slice(0, 5))) {
            setCurrentStepIndex(i => {
                if (i > props.steps.length - 1) return i;
                return i + 1;
            });

            axios.post('/answers', {
                "statementId": props.steps[currentStepIndex].id,
                "questionOneAgree": 0,
                "questionOneWhy": 3,
                "questionTwoAgree": 0,
                "questionTwoWhy": 1,
                "questionThreeAgree": 1,
                "questionThreeWhy": 3,
                "origLanguage": "en",
                "sessionId": props.sessionId,
            })
                .then(response => console.log(response.data));

        } else {
            console.log(whichQuestion(props.steps[currentStepIndex].answers.slice(0, 5)));
            return whichQuestion(props.steps[currentStepIndex].answers.slice(0, 5));
        }

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }

    function back() {
        setCurrentStepIndex(i => {
            if (i <= 0) return i;
            return i - 1;
        });

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }

    function goTo(index) {
        setCurrentStepIndex(index);
    }

    return {
        currentStepIndex,
        step: props.steps[currentStepIndex],
        goTo,
        next,
        back,
        steps: props.steps
    }
}

export default MultiStepForm;