import React, { useEffect, useState } from "react";

import './style.css';

function MultiStepForm(props) {

    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    function next() {
        setCurrentStepIndex(i => {
          if (i > props.steps.length - 1) return i;
          return i + 1;
        });

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