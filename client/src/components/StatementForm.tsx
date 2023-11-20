import React, { useState } from "react";

type Feature = {
  checked: boolean;
  text: string;
  description: string;
};

type FeatureState = {
  feature1: Feature;
  feature2: Feature;
  feature3: Feature;
};

const initialState: FeatureState = {
  feature1: { checked: false, text: "Behavior", description: "Does the statement describe a behavior?" },
  feature2: { checked: false, text: "Everyday", description: "Is this an statement that you would use everyday?" },
  feature3: { checked: false, text: "Figure of speech", description: "Is this a figure of speech?" },
};

const StatementForm = () => {
  const [statement, setStatement] = useState<string>("");
  const [features, setFeatures] = useState<FeatureState>(initialState);

  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFeatures((prevFeatures) => ({
      ...prevFeatures,
      [name]: { ...prevFeatures[name], checked: checked },
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission, typically involving state management or API calls.
    console.log("Submitted Statement:", statement);
    console.log("Submitted Features:", features);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="form-control my-4">
          <label className="label">
            <span className="label-text">
              Enter your common sense statement:
            </span>
          </label>
          <textarea
            className="textarea textarea-bordered h-24 p-3 bg-white w-full rounded-md"
            placeholder="Type here"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
          ></textarea>
        </div>

        {Object.entries(features).map(
          ([key, { checked, text, description }]) => (
            <div className="flex items-center justify-between my-4" key={key}>
              <div className="label grow-0">
                <span className="label-text">
                  {text}: <small>({description})</small>
                </span>
              </div>
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  className="toggle toggle-gray-300 toggle-lg"
                  name={key}
                  checked={checked}
                  onChange={handleFeatureChange}
                />
              </label>
            </div>
          )
        )}

        <div className="form-control mt-6">
          <button
            type="submit"
            className="btn text-white p-3 bg-gray-600 hover:bg-gray-700 w-full mb-4 rounded-md sm:w-auto sm:mb-0"
          >
            Submit Statement
          </button>
        </div>
      </form>
    </div>
  );
};

export default StatementForm;
