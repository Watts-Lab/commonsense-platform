import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import './style.css';

function Result(props) {

    function isUserDone(statementsData) {
        for(let i = 0; i < statementsData.length; i++) {
            if(!statementsData[i].answereSaved) {
                return false;
            }
        }
        return true;
    }
    
    return (
        <div className="text-justify leading-relaxed">
            
            <p className="pb-4">You've completed the common sense trial. At any point you can answer more questions by logging in.</p>

            <p className="font-bold pb-2.5">Here's your common sense score: ###</p>

            <p>This is calculated by comparing your answers to others answers, so it will become more accurate if you answer more questions and it will become more accurate as others answer more questions. 
                If you log in you can continue to see this score as it updates over time.</p>
            
            <div className="flex flex-col items-center pt-7">
            <Link to="/signup">
            <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Sign Up
            </button>
            </Link>
            </div>
        
        </div>
    )
}

export default Result;