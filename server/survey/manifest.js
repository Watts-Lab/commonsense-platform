module.exports = {
  treatments: [
    {
      statements: [5, 12, 14, 15], // (list of statements, or callback)
      randomization: "none", // (none, fully random, callback)
    },
    {
      statements: getAllStatements(),
      randomization: "random",
    },
    {
      statements: getDesignSpace({
        // design space parameters
        behavior: false,
        everyday: true,
        figure_of_speech: false,
        judgment: false,
        opinion: false,
        reasoning: false,
      }),
      randomization: "none",
    },
  ],
  
  // how are people assigned to a treatment?
  assignment: "random", // [random, round robin (1, then 2, then 3, then 1,...), callback()]
  
};
