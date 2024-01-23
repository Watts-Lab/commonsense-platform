export default {
  name: "MTurk Design Space B",
  description:
    "get statements from design space [1,1,0,1,1,0] and [1,1,0,1,0,0]",
  statements: getStatementById,
  statements_params: {
    ids: [
      7025,
      8549,
      4855,
      4838,
      7587,
      7259,
      7664,
      8531,
      8139,
      4539, // 10 statements from design space A1
      8763,
      7267,
      7526,
      6695,
      7900,
      8615,
      7383,
      7282,
      8696,
      7865, // 10 statements from design space B1
      7547,
      4970,
      4949,
      7590,
      8222,
      7912,
      7784,
      7836,
      7171,
      7271, // 10 statements from design space B2
    ],
    // limit: 40,
  },
  critirion: {
    source: "mturk",
  },
  randomization: "none",
};
