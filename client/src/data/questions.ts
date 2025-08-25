export interface MultipleChoiceQuestionType {
  id: number;
  type: "multipleChoice";
  question: string;
  description?: string;
  possibleAnswers: { [key: number]: string };
  tooltip: string;
  required: boolean;
}

export interface TextQuestionType {
  id: number;
  type: "text";
  question: string;
  description?: string;
  tooltip: string;
  required: boolean;
}

export type IQuestionData = { type: "text" | "multipleChoice" } & (
  | MultipleChoiceQuestionType
  | TextQuestionType
);

// If any changes are made to the questions, make sure to update the translation files in the client/src/locales folder
export const questionData: IQuestionData[] = [
  {
    id: 1,
    type: "multipleChoice",
    question: "Do you agree with this statement?",
    description:
      "(If your answer depends on the situation, please choose the response that best reflects your most common or likely answer.)",
    possibleAnswers: {
      1: "Yes",
      2: "No",
    },
    tooltip: "Do you consider this statement to be common sense?",
    required: true,
  },
  {
    id: 2,
    type: "multipleChoice",
    question: "Why did you answer that way about <b>yourself?</b>",
    possibleAnswers: {
      1: "It's obvious",
      2: "It's something I learned",
      3: "It's my opinion",
      4: "I don't know",
    },
    tooltip:
      "Please explain the main reason for your answer. We want to understand what influenced your decision.",
    required: true,
  },
  {
    id: 3,
    type: "multipleChoice",
    question: "Do you think most other people would agree with this statement?",
    description:
      "(If your answer depends on the situation, please choose the response that best reflects your most common or likely answer.)",
    possibleAnswers: {
      1: "Yes",
      2: "No",
    },
    tooltip:
      "Do you think that, in general, most people would view this statement as common sense?",
    required: true,
  },
  {
    id: 4,
    type: "multipleChoice",
    question: "Why did you answer that way about most <b>other people?</b>",
    possibleAnswers: {
      1: "I think most people have good judgment about this topic",
      2: "I think most people lack good judgment about this topic",
      3: "I think it's mostly a matter of opinion",
      4: "I don't know",
    },
    tooltip:
      "Please explain your reasoning for how you think most people would respond.",
    required: true,
  },
  {
    id: 5,
    type: "multipleChoice",
    question:
      "Overall, do you think this statement is an example of common sense?",
    possibleAnswers: {
      1: "Yes",
      2: "No",
    },
    tooltip: "Do you consider this statement to be an example of common sense?",
    required: true,
  },
  {
    id: 6,
    type: "text",
    question:
      "<b>Optional:</b> Do you have any other comments or feedback about this statement?",
    description:
      "Please share any additional thoughts or feedback you have about the statement.",
    tooltip:
      "This optional question allows you to provide any further comments or feedback about the statement.",
    required: false,
  },
  // {
  //   id: 8,
  //   type: "multipleChoice",
  //   question:
  //     "<b>Optional:</b> How do you think most people would categorize this statement?",
  //   possibleAnswers: [
  //     "Clear: it is clearly written and I can understand the meaning",
  //     "Confusing: I don't quite understand what it means, but it seems like it is written correctly",
  //     "Gibberish: I don't know what it means, it is gibberish or poorly written so it doesn't make sense",
  //   ],
  //   tooltip:
  //     "How do you think most people would classify this statement in terms of clarity and meaning?",
  //   required: false,
  // },
];
