import * as React from 'react'

export interface ChildInputProps {
  name: string;
  title: string;
  description?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface BaseInputProps {
  title: string;
  description?: string;
  name: string;
  children: any;
}

export default function Base( {title, description, name, children }: BaseInputProps ) {
  return (
    <div className='inputBlock'>
      <span> <h4 className='base-title' data-testid={`${name}-title`}>{ title }</h4> </span>
      <span> <p className='base-description' data-testid={`${name}-description`}>{ description }</p> </span>
      <hr/>
      {children}
    </div>      
   )
}