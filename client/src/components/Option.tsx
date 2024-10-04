import React from "react";

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
        className="
      inline-flex items-center justify-between w-full h-20 p-5 cursor-pointer rounded-md
      text-sm text-gray-800 bg-gray-200 border border-gray-200
      hover:bg-gray-300 hover:text-gray-600
      peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:text-white
      peer-focus:ring-2 peer-focus:ring-blue-300
      dark:text-gray-100 dark:bg-gray-800 dark:border-gray-600
      dark:hover:bg-gray-700 dark:hover:text-white
      dark:peer-checked:bg-blue-500 dark:peer-checked:border-blue-500 dark:peer-checked:text-white
      dark:peer-focus:ring-2 dark:peer-focus:ring-blue-800
    "
      >
        <div className="block w-full text-md">{props.text}</div>
      </label>
    </li>
  );
}

export default Option;
