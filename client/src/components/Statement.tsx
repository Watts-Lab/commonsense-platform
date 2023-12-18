import React, { useEffect, useState } from "react";
import ProgressBar from "./ProgressBar";
import SurveyImage from "./SurveyImage";
import "./style.css";
import Question from "./Question";
import { questionData, IQuestionData } from "../data/questions"; // Import here

interface StatementProps {
  statementText: string;
  imageUrl: string;
  data: {
    answers: string[];
  };
  statementId: number;
  currentStep: number;
  totalSteps: number;
  onChange: (statementId: number, answers: string[]) => void;
  unansweredQuestionIndex?: number;
}

function Statement({
  statementText,
  imageUrl,
  data,
  statementId,
  currentStep,
  totalSteps,
  onChange,
  unansweredQuestionIndex,
}: StatementProps) {
  const [answers, setAnswers] = useState<string[]>(data.answers);

  useEffect(() => {
    onChange(statementId, answers);
  }, [answers, onChange]);

  const handleAnswerChange = (id: number, value: string) => {
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[id - 1] = value;
      data.answers[id - 1] = value;
      return newAnswers;
    });
  };

  return (
    <>
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      <SurveyImage imageName={imageUrl} />
      <div className="!sticky !top-0 !z-50 bg-white border-double border-blue-600 border-b-2">
        <h3 className="mt-3.5 text-xl font-medium text-gray-900 dark:text-white text-center py-4">
          {statementText}
        </h3>
      </div>
      <p className="px-3 pt-3 tracking-tighter text-gray-500 md:text-sm dark:text-gray-400">
        Required fields are marked with an asterisk *
      </p>
      {questionData.map((question, index) => {
        const isUnanswered = unansweredQuestionIndex === index + 1;
        return (
          <Question
            key={index}
            statementId={statementId}
            question={question}
            answerValue={answers[index]}
            setAnswer={handleAnswerChange}
            unanswered={isUnanswered}
          />
        );
      })}
    </>
  );
}

export default Statement;

// function Statement({
//   statementText,
//   imageUrl,
//   data,
//   statementId,
//   currentStep,
//   totalSteps,
//   onChange,
//   unansweredQuestionIndex,
// }: StatementProps) {
//   const [questionOneAgree, setQuestionOneAgree] = useState<boolean>(
//     data.answers[0]
//   );
//   const [questionOneOpinion, setQuestionOneOpinion] = useState<boolean>(
//     data.answers[1]
//   );
//   const [questionTwoAgree, setQuestionTwoAgree] = useState<boolean>(
//     data.answers[2]
//   );
//   const [questionTwoOpinion, setQuestionTwoOpinion] = useState<boolean>(
//     data.answers[3]
//   );
//   const [questionThreeAgree, setQuestionThreeAgree] = useState<boolean>(
//     data.answers[4]
//   );
//   const [questionThreeOpinion, setQuestionThreeOpinion] = useState<boolean>(
//     data.answers[5]
//   );

//   useEffect(() => {
//     onChange(statementId, [
//       questionOneAgree,
//       questionOneOpinion,
//       questionTwoAgree,
//       questionTwoOpinion,
//       questionThreeAgree,
//       questionThreeOpinion,
//     ]);
//     // Be careful with writing to props like this as props in React are meant to be immutable
//     // This line can have unexpected side effects.
//     data.answers = [
//       questionOneAgree,
//       questionOneOpinion,
//       questionTwoAgree,
//       questionTwoOpinion,
//       questionThreeAgree,
//       questionThreeOpinion,
//     ];
//     // console.log('props.data %O', data.answers);
//   }, [
//     questionOneAgree,
//     questionOneOpinion,
//     questionTwoAgree,
//     questionTwoOpinion,
//     questionThreeAgree,
//     questionThreeOpinion,
//   ]);

//   const handleSetQuestion = (questionId: number, value: string) => {
//     setAnswers({
//       ...answers,
//       [questionId]: value,
//     });
//   };

//   return (
//     <>
//       <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
//       <SurveyImage imageName={imageUrl} />
//       <p className="text-gray-600">
//         Answer questions below about the following statement:
//       </p>
//       <div className="!sticky !top-0 !z-50 bg-white border-double border-blue-600 border-b-2">
//         <h3 className="mt-3.5 text-xl font-medium text-gray-900 dark:text-white text-center py-4">
//           {statementText}
//         </h3>
//       </div>
//       <p className="px-3 pt-3 tracking-tighter text-gray-500 md:text-sm dark:text-gray-400">
//         Required fields are marked with an asterisk *
//       </p>
//       {questionsConfig.map((questionData, index) => (
//         <Question
//           key={questionData.id}
//           statementId={statementId}
//           question={questionData}
//           // answerValue={answers[questionData.id]}
//           setQuestion={handleSetQuestion}
//           unansweredQuestionIndex={unansweredQuestionIndex}
//         />
//       ))}
//       <QuestionOne
//         statementId={statementId}
//         questionOneAgree={questionOneAgree}
//         questionOneOpinion={questionOneOpinion}
//         setQuestionOneAgree={setQuestionOneAgree}
//         setQuestionOneOpinion={setQuestionOneOpinion}
//         unansweredQuestionIndex={unansweredQuestionIndex}
//       />
//       <p className="p-5"></p>
//       <QuestionTwo
//         statementId={statementId}
//         questionTwoAgree={questionTwoAgree}
//         questionTwoOpinion={questionTwoOpinion}
//         setQuestionTwoAgree={setQuestionTwoAgree}
//         setQuestionTwoOpinion={setQuestionTwoOpinion}
//       />
//       <p className="p-5"></p>
//       <QuestionThree
//         statementId={statementId}
//         questionThreeAgree={questionThreeAgree}
//         questionThreeOpinion={questionThreeOpinion}
//         setQuestionThreeAgree={setQuestionThreeAgree}
//         setQuestionThreeOpinion={setQuestionThreeOpinion}
//       />
//     </>
//   );
// }

// export default Statement;
