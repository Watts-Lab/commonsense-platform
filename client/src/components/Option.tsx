import React from "react";
import "./style.css";

interface OptionProps {
  id_v: string;
  text: string;
  statementClass: string;
  checked: boolean;
  required: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function Option({
  id_v,
  text,
  statementClass,
  checked,
  required,
  onChange,
}: OptionProps) {
  return (
    <li className="relative">
      <input
        type="radio"
        id={id_v}
        name={statementClass}
        value={id_v}
        className="sr-only peer"
        required={required}
        onChange={onChange}
        checked={checked}
      />
      <label
        htmlFor={id_v}
        className="
          inline-flex items-center justify-between w-full min-h-[5rem] p-4 cursor-pointer rounded-2xl
          text-sm font-semibold
          bg-white text-gray-700 border-2 border-gray-200
          hover:bg-indigo-50/30 hover:border-indigo-300 hover:text-indigo-900

          peer-checked:bg-gradient-to-br
          peer-checked:from-sky-600
          peer-checked:to-indigo-700
          peer-checked:border-indigo-500
          peer-checked:text-white
          peer-checked:shadow-lg

          peer-focus-visible:ring-4 peer-focus-visible:ring-indigo-300

          dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700
          dark:hover:bg-indigo-900/20 dark:hover:border-indigo-500 dark:hover:text-white

          dark:peer-checked:from-sky-600
          dark:peer-checked:to-indigo-700
          dark:peer-checked:border-indigo-500
          dark:peer-checked:text-white

          dark:peer-focus-visible:ring-indigo-900/60

          transition-all duration-200 active:scale-[0.98] shadow-md hover:shadow-lg
  "
      >
        <div className="flex flex-col w-full">
          <div className="w-full text-md leading-snug">{text}</div>
        </div>
      </label>
    </li>
  );
}

export default Option;
