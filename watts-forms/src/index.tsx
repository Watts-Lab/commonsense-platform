// components/survey/index.tsx
import React from "react";
import Checkbox from "./inputs/checkbox";
import Radio from "./inputs/radio";
import Submit from "./inputs/submit";
import Text from "./inputs/text";

export type Element = {
  type: string;
  name: string;
  title: string;
  description?: any;
  choices?: string[];
}

export type Attribute = {
  key: string
  value: string 
}

export interface FormProps {
  elements: Element[]
  hiddenAttributes?: Attribute[]
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export const SinglePageForm = ({elements, hiddenAttributes, onChange, onSubmit}: FormProps) => {
  const createInput = (element: Element) => {
    switch (element.type) {
      case "radio":
        return <Radio {...element} onChange={onChange} />
      case "text":
        return <Text {...element} />
      case "checkbox":
        return <Checkbox {...element} onChange={onChange} />
      default:
        return null;
    }
  }

  return (
    <form onSubmit={onSubmit} data-testid="watts-form" > 
      {
        elements.map(element => createInput(element))
      }
      {
        hiddenAttributes?.map(attribute => <input type="hidden" name={attribute.key} value={attribute.value} />)
      }
      <Submit />
    </form>
  );
}

export default SinglePageForm