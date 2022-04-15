import * as React from "react";
import Base from "./base";

export interface CheckboxInputProps {
  name: string;
  title: string;
  description?: string;
  choices?: string[];
}

export default function CheckboxGroup({name, title, description, choices }: CheckboxInputProps) {
  if (choices === undefined) {
    choices = []
  }

  const option = (choice: string, index: number) => {
    return (
    <React.Fragment key={`${name}-${choice}-${index}-key`}>
      <input type="checkbox" className="form-checkbox" value={choice} name={name} id={`${name}-${choice}`} key={`${name}-${index}`} />
      <label className="form-checkbox-label" htmlFor={`${name}-${choice}`}>  {choice} </label>
    </React.Fragment>)
  }
  
  
    return (
      <Base title={title} description={description} name={name}>
        {
          choices.map((choice, index) => option(choice, index))
        }
      </Base>
    )
  
  
      
  }
  