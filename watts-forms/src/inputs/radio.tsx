import React from "react";
import Base, { ChildInputProps } from "./base";

export interface RadioInputProps extends ChildInputProps {
  choices?: string[];
}

export default function Radio({ name, title, description, choices, onChange }: RadioInputProps) {
  if (choices === undefined) {
    choices = []
  }
 
  const option = (choice: string, index: number) => {    
    const id = `${name}-${choice}`;
    return (
      <React.Fragment key={`${name}-${choice}-${index}-key`}>
        <input type="radio" className="form-radio" value={choice} name={name} id = {id} data-testid = {id + "-input"} required={true} onChange={onChange}/>
        <label className="form-radio-label" htmlFor={id} data-testid = {id + "-label"}> {choice} </label>
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
