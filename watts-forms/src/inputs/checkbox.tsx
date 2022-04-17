import * as React from "react";
import Base, { ChildInputProps } from "./base";

export interface CheckboxInputProps extends ChildInputProps {
  choices?: string[];
}

export interface CheckboxComponent {
  choice: string;
  index: number;
  name: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Option = ({choice, name, index, onChange}: CheckboxComponent) => {

  const id = `${name}-${choice}`;
  return (
    <React.Fragment key={`${name}-${choice}-${index}-key`}>
      <input type="checkbox" className="form-checkbox" value={choice} name={`${name}-${index}`} onChange = {onChange} id= {id} data-testid={id + "-input"} />
      <label className="form-checkbox-label" htmlFor={`${name}-${choice}`} id= {id} data-testid={id + "-label"}>  {choice} </label>
    </React.Fragment>
  )
}
 


export default function CheckboxGroup({name, title, description, choices, onChange }: CheckboxInputProps) {
  if (choices === undefined) {
    choices = []
  }


  return (
    <Base title={title} description={description} name={name}>
      {
        choices.map((choice, index) => <Option name = {name} choice={choice} index = {index} onChange={onChange} />)
      }
    </Base>
  )

  
      
  }
  