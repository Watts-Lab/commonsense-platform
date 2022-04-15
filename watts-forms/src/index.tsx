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

export interface FormProps {
  elements: Element[]
}

export const SinglePageForm = ({elements}: FormProps) => {
  const createInput = (element: Element) => {
    switch (element.type) {
      case "radio":
        return <Radio {...element} />
      case "text":
        return <Text {...element} />
      case "checkbox":
        return <Checkbox {...element} />
      default:
        return null;
    }
  }

  return (
    <form>
      {
        elements.map(element => createInput(element))
      }
      <Submit />
    </form>
  );
}

export default SinglePageForm