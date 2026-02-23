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
    <li>
      <input
        type="radio"
        id={props.id_v}
        name={props.statementClass}
        value={props.id_v}
        className="sr-only peer"
        checked={props.checked}
        onChange={props.onChange}
        required={props.required}
      />
      <label
        htmlFor={props.id_v}
        className="
          inline-flex items-center justify-between w-full min-h-[5rem] p-4 cursor-pointer rounded-xl
          text-sm text-gray-700 bg-gray-100 border-2 border-transparent
          hover:bg-gray-200 hover:text-gray-800
          peer-checked:bg-indigo-600 peer-checked:border-indigo-600 peer-checked:text-white
          peer-focus-visible:ring-4 peer-focus-visible:ring-indigo-300
          dark:text-gray-200 dark:bg-gray-800 dark:border-transparent
          dark:hover:bg-gray-700 dark:hover:text-white
          dark:peer-checked:bg-indigo-600 dark:peer-checked:border-indigo-500 dark:peer-checked:text-white
          dark:peer-focus-visible:ring-4 dark:peer-focus-visible:ring-indigo-700
          transition-all duration-150
        "
      >
        <div className="block w-full text-md leading-snug">{props.text}</div>
      </label>
    </li>
  );
}

export default Option;
