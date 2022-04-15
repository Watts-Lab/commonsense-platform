import React from "react";
import Base from "./base";

export interface RadioInputProps {
  name: string;
  title: string;
  description?: string;
  choices?: string[];
}


export default function Radio({ name, title, description, choices }: RadioInputProps) {
  if (choices === undefined) {
    choices = []
  }
  
  const option = (choice: string, index: number) => {    
    return (
      <React.Fragment key={`${name}-${choice}-${index}-key`}>
        <input type="radio" className="form-radio" value={choice} name={name} key={`${name}-${choice}-${index}`} id={`${name}-${choice}`}  required={true} />
        <label className="form-radio-label" htmlFor={`${name}-${choice}`}> {choice} </label>
      </React.Fragment>
    )
  }


  return (
    <Base title={title} description={description} name={name}>
      {
        choices.map((choice, index) => option(choice, index))
      }
    </Base>
  )


    
}
