import React, { useState } from "react";
import Backend from "../apis/backend";

type Feature = {
  checked: boolean;
  text: string;
  description: string;
};

type KnowledgeCategories = {
  [category: string]: string;
};

type FeatureState = {
  behavior: Feature;
  everyday: Feature;
  figureOfSpeech: Feature;
  judgment: Feature;
  opinion: Feature;
  reasoning: Feature;
};

const knowledgeCategories: KnowledgeCategories = {
  generalReference: "General reference",
  cultureAndArts: "Culture and the arts",
  geographyAndPlaces: "Geography and places",
  healthAndFitness: "Health and fitness",
  historyAndEvents: "History and events",
  humanActivities: "Human activities",
  mathematicsAndLogic: "Mathematics and logic",
  naturalAndPhysicalSciences: "Natural and physical sciences",
  peopleAndSelf: "People and self",
  philosophyAndThinking: "Philosophy and thinking",
  religionAndBeliefSystems: "Religion and belief systems",
  societyAndSocialSciences: "Society and social sciences",
  technologyAndAppliedSciences: "Technology and applied sciences",
};

const initialState: FeatureState = {
  behavior: {
    checked: false,
    text: "Behavior",
    description:
      "Is the statement primarily concerned with beliefs, perceptions, preferences, and socially constructed rules governing human experience (even if it can be either 'real' or opinion)?",
  },
  everyday: {
    checked: false,
    text: "Everyday",
    description:
      "Does the statement describe situations that people encounter or could encounter in the course of their ordinary, everyday experiences?",
  },
  figureOfSpeech: {
    checked: false,
    text: "Figure of speech",
    description:
      "Does the statement contain an aphorism, metaphor, or hyperbole, or is it expressed in plain and ordinary language that means exactly what it says?",
  },
  judgment: {
    checked: false,
    text: "Judgment",
    description:
      "Is the statement primarily concerned with a judgment, belief, value, social norm, or convention?",
  },
  opinion: {
    checked: false,
    text: "Opinion",
    description:
      "Is the statement something that someone might think is true or wants others to think is true but can't be demonstrated to be objectively correct or incorrect; is it inherently subjective?",
  },
  reasoning: {
    checked: false,
    text: "Reasoning",
    description:
      "Does the claim present a conclusion that is arrived at by combining knowledge and logic?",
  },
};

const StatementForm = () => {
  const [statement, setStatement] = useState<string>("");
  const [features, setFeatures] = useState<FeatureState>(initialState);
  const [knowledgeCategory, setKnowledgeCategory] = useState<string>("");

  // for submission status
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  // keep track of whether the statement field is valid
  const [isStatementValid, setIsStatementValid] = useState(true);

  const tokenString = localStorage.getItem("token");
  const token = tokenString !== null ? JSON.parse(tokenString) : null;

  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFeatures((prevFeatures) => ({
      ...prevFeatures,
      [name]: { ...prevFeatures[name], checked },
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setKnowledgeCategory(value);
  };

  const validateStatement = () => {
    setIsStatementValid(statement.trim().length > 0);
  };

  const submitUserStatement = async (statementData) => {
    try {
      Backend.defaults.headers.common["Authorization"] = token;
      const response = await Backend.post(
        "/userstatements/create",
        statementData
      );
      return response.data;
    } catch (error) {
      console.error("Error submitting user statement:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    validateStatement();

    if (!isStatementValid) {
      return;
    }

    // Prepare the data in the format expected by the Sequelize model
    const statementData = {
      statementText: statement,

      statementProperties: {
        behavior: features.behavior.checked,
        everyday: features.everyday.checked,
        figureOfSpeech: features.figureOfSpeech.checked,
        judgment: features.judgment.checked,
        opinion: features.opinion.checked,
        reasoning: features.reasoning.checked,
        knowledgeCategory: knowledgeCategory,
      },
    };

    try {
      const submissionResult = await submitUserStatement(statementData);
      setIsSubmitted(true);
      setSubmissionError("");
    } catch (error) {
      setSubmissionError("There was an error submitting the form.");
    }
  };

  const handleReset = () => {
    setStatement("");
    setFeatures(initialState);
    setKnowledgeCategory("");
    setIsSubmitted(false);
    setSubmissionError("");
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {isSubmitted ? (
        <div className="my-4">
          <p>Successfully submitted!</p>
          <button onClick={handleReset} className="btn">
            Submit another one
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-4xl">
          <div className="form-control my-4">
            <label className="label">
              <span className="label-text font-semibold">
                Enter your common sense statement:
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24 p-3 bg-white dark:bg-gray-300 w-full rounded-md"
              placeholder="Type here"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              onBlur={validateStatement}
              required
            ></textarea>
          </div>

          {!isStatementValid && (
            <p className="text-red-500">Statement is required.</p>
          )}

          <div className="divider text-md">optional</div>

          {Object.entries(features).map(
            ([key, { checked, text, description }]) => (
              <div className="flex items-center justify-between my-4" key={key}>
                <div className="label grow-0 px-2">
                  <span className="label-text">
                    <span className="font-semibold">{text}</span>: {description}
                  </span>
                </div>
                <label className="label cursor-pointer px-2">
                  <input
                    type="checkbox"
                    className="toggle toggle-gray-300 toggle-sm"
                    name={key}
                    checked={checked}
                    onChange={handleFeatureChange}
                  />
                </label>
              </div>
            )
          )}

          <div className="form-control my-4">
            <label className="label">
              <span className="label-text">Knowledge Category:</span>
            </label>
            <select
              className="select select-bordered w-full rounded-md"
              value={knowledgeCategory}
              onChange={handleCategoryChange}
            >
              <option value="">Please select...</option>
              {Object.entries(knowledgeCategories).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          {submissionError && <p className="text-red-500">{submissionError}</p>}
          <div className="form-control mt-6">
            <button
              type="submit"
              className="btn text-white p-3 bg-gray-600 hover:bg-gray-700 w-full mb-4 rounded-md sm:w-auto sm:mb-0"
            >
              Submit Statement
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StatementForm;
