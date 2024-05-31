export interface IQuestionData {
  id: number;
  question: string;
  description?: string;
  possibleAnswers: string[];
  tooltip: string;
  required: boolean;
}

export const questionData: IQuestionData[] = [
  {
    id: 1,
    question: "Do you agree with this statement? *",
    description:
      "(if the answer is, it depends, respond with your most common or most likely answer)",
    possibleAnswers: ["Yes", "No"],
    tooltip: "If you think the statement is true or false.",
    required: true,
  },
  {
    id: 2,
    question: "Why did you answer the way you did about <b>yourself?</b> *",
    possibleAnswers: [
      "It's obvious",
      "It's something I learned",
      "It's my opinion",
      "I don't know",
    ],
    tooltip:
      "Why you chose the specific answer, we aim to understand the factors that influenced your decision. Please provide an explanation or rationale for your response.",
    required: true,
  },
  {
    id: 3,
    question:
      "Do you think most other people would agree with this statement? *",
    description:
      "(if the answer is, it depends, respond with your most common or most likely answer)",
    possibleAnswers: ["Yes", "No"],
    tooltip:
      "This question seeks to gather insights on the perceived consensus among individuals regarding the given statement. We are interested in understanding your opinion about whether you believe that the majority of other people would agree with the statement presented.",
    required: true,
  },
  {
    id: 4,
    question:
      "Why did you answer the way you did about most <b>other people?</b> *",
    possibleAnswers: [
      "I think most people have good judgement with regard to this topic",
      "I think most people lack good judgment with regard to this topic",
      "I think it's mostly a matter of opinion",
      "I don't know",
    ],
    tooltip:
      "This question aims to explore the reasoning behind your response regarding the perceived agreement of most other people with the given statement. We are interested in understanding the factors that influenced your decision and your perspective on how others might interpret or respond to the statement.",
    required: true,
  },
  {
    id: 5,
    question:
      "Overall, do you think this statement is an example of common sense?",
    possibleAnswers: ["Yes", "No"],
    tooltip:
      "This question seeks to gather insights on the perceived consensus among individuals regarding the given statement. We are interested in understanding your opinion about whether you believe that the majority of other people would agree with the statement presented.",
    required: true,
  },
  // {
  //   id: 6,
  //   question:
  //     "<b>Optional:</b> How do you think most people would categorize this statement",
  //   possibleAnswers: [
  //     "Clear: it is clearly written and I can understand the meaning",
  //     "Confusing: I don't quite understand what it means, but it seems like it is written correctly",
  //     "Gibberish: I don't know what it means, it is gibberish or poorly written so it doesn't make sense",
  //   ],
  //   tooltip:
  //     "This question aims to gather insights on how you believe most people would categorize the given statement in terms of common sense. We are interested in understanding your perception of how the majority of individuals would classify or label the statement in relation to its alignment with widely accepted general knowledge or intuitive understanding.",
  //   required: false,
  // },
];
