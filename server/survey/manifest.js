function getAllStatements() {
  return [5, 12, 14, 15];
}

function getDesignSpace(params) {
  const statements = [];
  return Math.random();
}

function roundRobinAssignment(assignments) {
  return assignments[Math.floor(Math.random() * assignments.length)];
}

function randomAssignment(assignments) {
  return assignments[Math.floor(Math.random() * assignments.length)];
}

module.exports = {
  treatments: [
    {
      name: "fixed five",
      description: "five statements fixed 10 varies",
      statements: [5, 12, 14, 15], // (list of statements, or callback)
      randomization: "none", // (none, fully random, callback)
      number_of_statements: 15,
    },
    {
      name: "control",
      description: "control",
      statements: getAllStatements,
      randomization: "weighted",
      number_of_statements: 15,
    },
    {
      name: "control",
      description: "control",
      statements: getDesignSpace,
      randomization: "none",
      number_of_statements: 15,
    },
  ],

  // how are people assigned to a treatment?
  assignment: roundRobinAssignment, // (round robin, random, callback)
};
