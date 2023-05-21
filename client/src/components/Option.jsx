import React, { useEffect, useState } from "react";
// import axios from "axios";

import './style.css';

function Option(props) {

  return (
    //  peer opacity-0
    <li>  
      <input type="radio" id={props.id_v} name={props.statementClass} value={props.id_v} className="peer hidden" checked={props.checked} onChange={e => {}} required={ props.required } />
      <label htmlFor={props.id_v} className="inline-flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-200 bg-gray-200 p-5 text-gray-800 hover:bg-gray-300 hover:text-gray-600 peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:text-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:peer-checked:text-blue-500">
        <div className="block">
          <div className="text-md w-full">{props.text}</div>
        </div>
      </label>
    </li>
  )
}

export default Option;