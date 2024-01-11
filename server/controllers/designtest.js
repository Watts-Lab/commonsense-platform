// import { TreatmentWithDesignSpaceInterface } from "../survey/treatments/treatment.types";

const treatmentController = require("../survey/treatments/design-point");

const treatmentWithConditions = {
  id: 1,
  name: "Example Treatment",
  description: "This is an example treatment with conditions.",
  published: true,
  randomization: false,
  seed: 42,
  createdAt: new Date(),
  conditions: {
    behavior: 1,
    everyday: 1,
    figure_of_speech: 0,
    judgment: 1,
    opinion: 0,
    reasoning: 1,
  },
};

const returnStatements = async (req, res) => {
  console.log(treatmentWithConditions);
  const gooz = await treatmentController.getDesignSpace(
    treatmentWithConditions
  );
  return res.json(gooz);
};

module.exports = {
  returnStatements,
};
