export default {
  name: "MTurk Design Space A, B with context",
  description:
    "get statements from design space [1,1,0,1,1,0] and [1,1,0,1,0,0]",
  statements: [
    {
      id: 7664,
      statement:
        "I endorse reforms that would improve the lives of millions of Americans.",
      image: "treatmeant16/exp1-1.jpg",
    },
    {
      id: 7269,
      statement: "People make mistakes while they work.",
      image: "treatmeant16/exp1-1.jpg",
    },
    {
      id: 8763,
      statement: "You would cut your hair because you want it shorter.",
      image: "treatmeant16/exp1-1.jpg",
    },
    {
      id: 8531,
      statement:
        "We should support the conservative push to move things forward.",
      image: "treatmeant16/exp1-1.jpg",
    },
    {
      id: 8549,
      statement: "We should support voting by mail.",
      image: "treatmeant16/exp1-1.jpg",
    },
    {
      id: 8696,
      statement: "You are likely to find a human in homes.",
      image: "treatmeant16/exp1-1.jpg",
    },
    {
      id: 7282,
      statement: "People open a window when they feel hot.",
      image: "treatmeant16/exp1-1.jpg",
    },
    {
      id: 7383,
      statement: "Provide no-cost health care coverage for all.",
      image: "treatmeant16/exp1-1.jpg",
    },
    {
      id: 8615,
      statement:
        "When people get together with friends, they usually engage in fun and healthy activities.",
      image: "treatmeant16/exp1-1.jpg",
    },
    {
      id: 8139,
      statement:
        "Proper hand hygiene is the optimal way to prevent disease spread.",
      image: "treatmeant16/exp1-1.jpg",
    },
  ],
  statements_params: {
    limit: 15,
  },
  critirion: {
    source: "mturk",
    context: "image",
  },
  randomization: "none",
};
