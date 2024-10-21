import React, { useState, useEffect } from "react";
import Backend from "../apis/backend";
import { useSession } from "../context/SessionContext";
import { useTranslation } from "react-i18next";

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

const StatementForm = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language; 

  const getTranslatedCategories = (): KnowledgeCategories => ({
    generalReference: t("knowledge-categories.general-reference"),
    cultureAndArts: t("knowledge-categories.culture-and-arts"),
    geographyAndPlaces: t("knowledge-categories.geography-and-places"),
    healthAndFitness: t("knowledge-categories.health-and-fitness"),
    historyAndEvents: t("knowledge-categories.history-and-events"),
    humanActivities: t("knowledge-categories.human-activities"),
    mathematicsAndLogic: t("knowledge-categories.mathematics-and-logic"),
    naturalAndPhysicalSciences: t("knowledge-categories.natural-and-physical-sciences"),
    peopleAndSelf: t("knowledge-categories.people-and-self"),
    philosophyAndThinking: t("knowledge-categories.philosophy-and-thinking"),
    religionAndBeliefSystems: t("knowledge-categories.religion-and-belief-systems"),
    societyAndSocialSciences: t("knowledge-categories.society-and-social-sciences"),
    technologyAndAppliedSciences: t("knowledge-categories.technology-and-applied-sciences",),
  });

  const getTranslatedInitialState = (): FeatureState => ({
    behavior: {
      checked: false,
      text: t("features.behavior.text"),
      description: t("features.behavior.description"),
    },
    everyday: {
      checked: false,
      text: t("features.everyday.text"),
      description: t("features.everyday.description"),
    },
    figureOfSpeech: {
      checked: false,
      text: t("features.figure-of-speech.text"),
      description: t("features.figure-of-speech.description"),
    },
    judgment: {
      checked: false,
      text: t("features.judgment.text"),
      description: t("features.judgment.description"),
    },
    opinion: {
      checked: false,
      text: t("features.opinion.text"),
      description: t("features.opinion.description"),
    },
    reasoning: {
      checked: false,
      text: t("features.reasoning.text"),
      description: t("features.reasoning.description"),
    },
  });

interface statementDataType {
  statementText: string;
  statementProperties: {
    behavior: boolean;
    everyday: boolean;
    figureOfSpeech: boolean;
    judgment: boolean;
    opinion: boolean;
    reasoning: boolean;
    knowledgeCategory: string;
  };
}

  const {
    state: { user },
  } = useSession();

  const [statement, setStatement] = useState<string>("");
  const [features, setFeatures] = useState<FeatureState>(getTranslatedInitialState);
  const [knowledgeCategory, setKnowledgeCategory] = useState<string>("");
  const [knowledgeCategories, setKnowledgeCategories] = useState<KnowledgeCategories>(getTranslatedCategories);

  // for submission status
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  // keep track of whether the statement field is valid
  const [isStatementValid, setIsStatementValid] = useState(true);

  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFeatures((prevFeatures) => ({
      ...prevFeatures,
      [name as keyof FeatureState]: {
        ...prevFeatures[name as keyof FeatureState],
        checked,
      },
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setKnowledgeCategory(value);
  };

  const validateStatement = () => {
    setIsStatementValid(statement.trim().length > 0);
  };

  const submitUserStatement = async (statementData: statementDataType) => {
    try {
      Backend.defaults.headers.common["Authorization"] = user?.token;
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
      await submitUserStatement(statementData);
      setIsSubmitted(true);
      setSubmissionError("");
    } catch {
      setSubmissionError("There was an error submitting the form.");
    }
  };

  const handleReset = () => {
    setStatement("");
    setFeatures(getTranslatedInitialState());
    setKnowledgeCategory("");
    setIsSubmitted(false);
    setSubmissionError("");
  };

  useEffect(() => {
    setFeatures(getTranslatedInitialState());
    setKnowledgeCategories(getTranslatedCategories());
  }, [language, t]); // update translated categories and features when the language changes

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {isSubmitted ? (
        <div className="my-4">
          <p>{t('statement-form.success-message')}</p>
          <button onClick={handleReset} className="btn">
            {t('statement-form.submit-another')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-4xl">
          <div className="form-control my-4">
            <label className="label">
              <span className="label-text font-semibold">
                {t('statement-form.enter-statement')}
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24 p-3 bg-white dark:bg-gray-300 w-full rounded-md"
              placeholder={t('statement-form.placeholder')}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              onBlur={validateStatement}
              required
            ></textarea>
          </div>

          {!isStatementValid && (
            <p className="text-red-500">{t('statement-form.required-message')}</p>
          )}

          <div className="divider text-md">{t('statement-form.optional')}</div>

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
              <span className="label-text">{t('statement-form.knowledge-category')}</span>
            </label>
            <select
              className="select select-bordered w-full rounded-md"
              value={knowledgeCategory}
              onChange={handleCategoryChange}
            >
              <option value="">
                {t('statement-form.select-category')}
              </option>
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
              {t('statement-form.submit-button')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StatementForm;
