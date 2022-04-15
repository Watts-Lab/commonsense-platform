import * as React from 'react';
import Base from './base';

export interface TextInputProps {
  name: string;
  title: string;
  description?: string;
}

export default function Text({name, title, description }: TextInputProps) {
  
  return (
    <Base name={name} title = {title} description = {description}>
      <input type="text" className="form-text" name={name} id={`${name}-text`} required={true} />
    </Base>    
  )    
}
