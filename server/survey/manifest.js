const { statements, statementproperties, answers } = require("../models");
const { getStatementsWeighted } = require("../controllers/statements.js");

const { Sequelize, QueryTypes } = require("sequelize");
const Op = Sequelize.Op;

function getRandom(arr, n) {
  var result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len)
    throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
    var x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

async function getStatementByWeight(params) {
  const listOfStatements = await getStatementsWeighted(
    params.sessionId,
    [],
    params.limit
  );

  return listOfStatements;
}

async function getAllStatements(params) {
  try {
    const statementList = await statements.findAll({
      attributes: ["id", "statement"],
      order: Sequelize.literal("rand()"),
      limit: params.limit,
    });

    // console.log("Statement List:", statementList);
    return statementList;
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error("Error fetching statements:", error);
    throw error;
  }
}

async function getStatementById(params) {
  const statementsText = await statements.findAll({
    where: {
      id: params.ids,
    },
    attributes: ["id", "statement"],
    order: Sequelize.literal("rand()"),
  });

  if (!params.limit) {
    return statementsText;
  } else {
    return getRandom(statementsText, params.limit);
  }
}

async function getDesignSpace(params) {
  // creates a pivot table of statement properties
  const statementsPivot = await statementproperties.findAll({
    attributes: [
      "statementId",
      [
        Sequelize.literal(
          "MAX(CASE WHEN statementproperties.name = 'behavior' THEN statementproperties.available END)"
        ),
        "behavior",
      ],
      [
        Sequelize.literal(
          "MAX(CASE WHEN statementproperties.name = 'everyday' THEN statementproperties.available END)"
        ),
        "everyday",
      ],
      [
        Sequelize.literal(
          "MAX(CASE WHEN statementproperties.name = 'figure_of_speech' THEN statementproperties.available END)"
        ),
        "figure_of_speech",
      ],
      [
        Sequelize.literal(
          "MAX(CASE WHEN statementproperties.name = 'judgment' THEN statementproperties.available END)"
        ),
        "judgment",
      ],
      [
        Sequelize.literal(
          "MAX(CASE WHEN statementproperties.name = 'opinion' THEN statementproperties.available END)"
        ),
        "opinion",
      ],
      [
        Sequelize.literal(
          "MAX(CASE WHEN statementproperties.name = 'reasoning' THEN statementproperties.available END)"
        ),
        "reasoning",
      ],
      [Sequelize.col("statement.statement"), "statement"],
    ],
    group: ["statementId"],
    raw: true,
    include: [
      {
        model: statements,
        attributes: ["parentId", "statement"],
        where: {
          published: true, // Filter for published statements
        },
      },
    ],
  }); // filters the pivot table by the params

  const filteredStatementIds = statementsPivot
    .filter((data) => {
      return (
        data.behavior === params.space.behavior &&
        data.everyday === params.space.everyday &&
        data.figure_of_speech === params.space.figure_of_speech &&
        data.judgment === params.space.judgment &&
        data.opinion === params.space.opinion &&
        data.reasoning === params.space.reasoning
      );
    })
    .map((data) => {
      return { id: data.statementId, statement: data.statement };
    });

  if (!params.limit) {
    return filteredStatementIds;
  } else {
    return getRandom(filteredStatementIds, params.limit);
  }
}

// assignment functions

// round robin assignment
function roundRobinAssignment(assignments) {
  return assignments[Math.floor(Math.random() * assignments.length)];
}

// random assignment
function randomAssignment(assignments) {
  return assignments[Math.floor(Math.random() * assignments.length)];
}

module.exports = {
  treatments: [
    {
      id: 1,
      name: "fixed five",
      description: "five statements fixed 10 varies",
      statements: [
        {
          id: 2009,
          statement:
            "if max adds fuel to the fire then max wants to cook some food on the fire",
        },
        {
          id: 6,
          statement: "a battery can't provide power forever",
        },
        {
          id: 149,
          statement: "a theist is the opposite of an atheist",
        },
        {
          id: 2904,
          statement:
            "people usually know how to correctly chnage baby's diaper when they do it",
        },
        {
          id: 3621,
          statement:
            "the world needs dreamers and the world needs doers but above all the world needs dreamers who do",
        },
        {
          id: 304,
          statement: "being tired would make you want to have a rest",
        },
        {
          id: 2355,
          statement:
            "in youth we run into difficulties in old age difficulties run into us",
        },
        {
          id: 111,
          statement: "a person doesn't want to be punished",
        },
        {
          id: 374,
          statement: "climate change is not fake",
        },
        {
          id: 3189,
          statement:
            "something you might do while playing basketball is score points",
        },
        {
          id: 2506,
          statement: "knowledge has no limit",
        },
        {
          id: 1937,
          statement:
            "if max achieves max's objective then max needs to know the objective",
        },
        {
          id: 479,
          statement: "electricity powers the cities of the world",
        },
        {
          id: 2753,
          statement:
            "one must always hope when one is desperate and doubt when one hopes",
        },
        {
          id: 327,
          statement: "butter is yellow",
        },
      ],
      statements_params: {
        limit: 15,
      },
      critirion: {
        source: "duncan",
      },
      randomization: "none",
    },
    {
      id: 2,
      name: "integrative design",
      description: "get statements from design space [0,1,0,0,0,0]",
      statements: [
        {
          id: 1181,
          statement: "if alex scratches the ticket he use his hand",
        },
        {
          id: 571,
          statement:
            "frequently moving your body in natural ways keeps you healthy",
        },
        {
          id: 2785,
          statement:
            "our physical health is highly dependent on what we choose for our diet",
        },
        {
          id: 338,
          statement: "canada is north of the united states",
        },
        {
          id: 3793,
          statement: "we are less than 61 000 away from our fundraising goal",
        },
        {
          id: 386,
          statement: "computers can never be an actual human",
        },
        {
          id: 191,
          statement:
            "all social movements are dismissed at some point as complaining over time they are recognized as speaking truth to power",
        },
        {
          id: 4259,
          statement: "winter is cold",
        },
        {
          id: 20,
          statement: "a computer virus is not living",
        },
        {
          id: 522,
          statement: "exercise increases fitness levels",
        },
        {
          id: 2268,
          statement: "if you burn wood you make smoke",
        },
        {
          id: 3148,
          statement: "something you find at a school is a child",
        },
        {
          id: 35,
          statement: "a full bladder would make you want to urinate",
        },
        {
          id: 553,
          statement: "florida is in the southern united states",
        },
        {
          id: 612,
          statement:
            "governemets should not place unnecessary regulatory burdens on farmers",
        },
      ],
      statements_params: {
        space: {
          behavior: 0,
          everyday: 1,
          figure_of_speech: 0,
          judgment: 0,
          opinion: 0,
          reasoning: 0,
        },
        limit: 15,
      },
      critirion: {
        source: "duncan",
      },
      randomization: "weighted",
    },
    {
      id: 3,
      name: "integrative design",
      description: "get statements from design space [1,0,0,1,1,1]",
      statements: [
        {
          id: 3847,
          statement: "we national mask mandate to stop the spread of covid19",
        },
        {
          id: 3265,
          statement:
            "talent is a pursued interest in other words anything you are willing to practice you can do",
        },
        {
          id: 2724,
          statement:
            "nothing can stop the man with the right mental attitude from achieving his goal nothing on earth can help the man with the wrong mental attitude",
        },
        {
          id: 2570,
          statement: "mail in voting should be allowed",
        },
        {
          id: 3873,
          statement: "we need to create centralized communities",
        },
        {
          id: 3367,
          statement:
            "the federal government has a responsibility to look out for the interests of individual states",
        },
        {
          id: 3885,
          statement: "we need to fight economic inequality",
        },
        {
          id: 4268,
          statement: "won't put politics over people",
        },
        {
          id: 2400,
          statement:
            "it is impossible to actually prove that god exists unless god wants it to be proven",
        },
        {
          id: 2474,
          statement:
            "john will thank mary if she passes an examination for him",
        },
        {
          id: 1029,
          statement:
            "if alex is a football player they would not wear a helmet",
        },
        {
          id: 3938,
          statement: "we need to support the every day american citizen",
        },
        {
          id: 658,
          statement:
            "he that is discontented in one place will seldom be content in another",
        },
        {
          id: 2886,
          statement:
            "people should not support katie porter and boycott media that support that person",
        },
        {
          id: 3967,
          statement: "we should all wear masks in public",
        },
      ],
      statements_params: {
        space: {
          // design space parameters
          behavior: 1,
          everyday: 0,
          figure_of_speech: 0,
          judgment: 1,
          opinion: 1,
          reasoning: 1,
        },
        limit: 15,
      },
      critirion: {
        source: "duncan",
      },
      randomization: "none",
    },

    {
      id: 4,
      name: "random statements",
      description: "get 5 statements by weight for facebook test",
      statements: getStatementByWeight,
      statements_params: {
        limit: 5,
      },
      critirion: {
        source: "facebook",
      },
      randomization: "none",
    },

    {
      id: 5,
      name: "random statements",
      description: "get 10 statements by weight for facebook test",
      statements: getStatementByWeight,
      statements_params: {
        limit: 10,
      },
      critirion: {
        source: "facebook",
      },
      randomization: "none",
    },

    {
      id: 6,
      name: "random statements",
      description: "get 15 statements by weight for facebook test",
      statements: getStatementByWeight,
      statements_params: {
        limit: 15,
      },
      critirion: {
        source: "facebook",
      },
      randomization: "none",
    },

    {
      id: 7,
      name: "random statements",
      description: "get 20 statements by weight for facebook test",
      statements: getStatementByWeight,
      statements_params: {
        limit: 20,
      },
      critirion: {
        source: "facebook",
      },
      randomization: "none",
    },

    {
      id: 8,
      name: "random statements",
      description: "get 25 statements by weight for facebook test",
      statements: getStatementByWeight,
      statements_params: {
        limit: 25,
      },
      critirion: {
        source: "facebook",
      },
      randomization: "none",
    },

    {
      id: 9,
      name: "random statements",
      description: "get 30 statements by weight for facebook test",
      statements: getStatementByWeight,
      statements_params: {
        limit: 30,
      },
      critirion: {
        source: "facebook",
      },
      randomization: "none",
    },

    {
      id: 10,
      name: "random statements",
      description: "get 35 statements by weight for facebook test",
      statements: getStatementByWeight,
      statements_params: {
        limit: 35,
      },
      critirion: {
        source: "facebook",
      },
      randomization: "none",
    },

    {
      id: 11,
      name: "random statements",
      description: "get 40 statements by weight for facebook test",
      statements: getStatementByWeight,
      statements_params: {
        limit: 40,
      },
      critirion: {
        source: "facebook",
      },
      randomization: "none",
    },

    {
      id: 12,
      name: "Design Space A",
      description: "get statements from design space [1,1,0,1,1,0]",
      statements: getDesignSpace,
      statements_params: {
        space: {
          // design space A
          behavior: 1,
          everyday: 1,
          figure_of_speech: 0,
          judgment: 1,
          opinion: 1,
          reasoning: 0,
        },
        limit: 15,
      },
      critirion: {
        source: "mturktest",
      },
      randomization: "none",
    },

    {
      id: 13,
      name: "Design Space B",
      description: "get statements from design space [1,1,0,1,0,0]",
      statements: getDesignSpace,
      statements_params: {
        space: {
          // design space B
          behavior: 1,
          everyday: 1,
          figure_of_speech: 0,
          judgment: 1,
          opinion: 0,
          reasoning: 0,
        },
        limit: 15,
      },
      critirion: {
        source: "mturktest",
      },
      randomization: "none",
    },

    {
      id: 14,
      name: "MTurk Design Space A",
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
          8350,
          7552,
          7397,
          5017,
          8353,
          7744,
          5988,
          6091,
          6863,
          8097, // 10 statements from design space A2
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
        ],
        // limit: 40,
      },
      critirion: {
        source: "mturk",
      },
      randomization: "none",
    },

    {
      id: 15,
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
    },

    {
      id: 16,
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
    },
    {
      id: 17,
      name: "random statements",
      description: "get 15 statements by weight for launch",
      statements: getStatementByWeight,
      statements_params: {
        limit: 15,
      },
      randomization: "none",
    },
  ],

  // how are people assigned to a treatment?
  assignment: roundRobinAssignment, // (round robin, random, callback)
};
