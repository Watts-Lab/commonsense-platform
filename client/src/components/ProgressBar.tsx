import React, { useEffect, useState } from "react";

import './style.css';

function ProgressBar(props) {
    
    const progressStyle = {
        width: Math.max(((props.currentStep)/(props.totalSteps))*100, 15) + "%", 
    }

    return (
    <>
    <div className="py-3">
      <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
        <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-1 leading-none rounded-full" style={progressStyle}> {props.currentStep} / {props.totalSteps} </div>
      </div>
    </div>
    </>
    )
}

export default ProgressBar;