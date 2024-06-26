import React, { useEffect, useState } from "react";
// import axios from "axios";

import "./style.css";

interface OptionProps {
  id_v: string;
  statementClass: string;
  text: string;
  checked: boolean;
  required: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function Option(props: OptionProps) {
  return (
    //  peer opacity-0 h-px w-px absolute
    <li>
      <input
        type="radio"
        id={props.id_v}
        name={props.statementClass}
        value={props.id_v}
        className="peer opacity-0 h-px w-px absolute"
        checked={props.checked}
        onChange={props.onChange}
        required={props.required}
      />
      <label
        htmlFor={props.id_v}
        className="h-20 text-s peer-focus:ring inline-flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-200 bg-gray-200 p-5 text-gray-800 hover:bg-gray-300 hover:text-gray-600 peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:text-white dark:border-gray-700 dark:bg-gray-400 dark:text-black dark:hover:bg-gray-700 dark:hover:text-gray-300 dark:peer-checked:text-blue-800 dark:peer-checked:bg-blue-100"
      >
        <div className="block">
          <div className="text-md w-full">{props.text}</div>
        </div>
      </label>
    </li>
  );
}

export default Option;
