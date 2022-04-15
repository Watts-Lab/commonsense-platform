import * as React from 'react'

export interface BaseInputsProps {
  title: string;
  description?: string;
  name: string;
  children: any;
}

export default function Base( {title, description, name, children }: BaseInputsProps ) {
  return (
    <div className='inputBlock'>
      <span> <h4 className='base-title' id = {`${name}-title`}>{ title }</h4> </span>
      <span> <p className='base-description' id={`${name}-description`}>{ description }</p> </span>
      <hr/>
      {children}
    </div>      
   )
}