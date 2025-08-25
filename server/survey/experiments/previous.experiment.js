const { GetStatementById } = require("../treatments/statement-by-id.treatment");

const defaultTreatment = [
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Reasoning",
      category: "People and self",
    },
    params: {
      ids: [
        416, 1700, 4063, 4230, 4244, 4398, 3509, 747, 1901, 2464, 4386, 3585,
        1994, 4201, 109,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Reasoning",
      category: "Human activities",
    },
    params: {
      ids: [
        3395, 3420, 4371, 1365, 4297, 2303, 283, 4383, 3130, 2291, 3942, 2090,
        3424, 1637, 289,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Reasoning",
      category: "Society and social sciences",
    },
    params: {
      ids: [
        3936, 4111, 3950, 2034, 3009, 432, 3017, 3380, 3591, 3960, 2780, 4080,
        348, 3357, 1650,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Knowledge",
      category: "Society and social sciences",
    },
    params: {
      ids: [
        4125, 3946, 3876, 3769, 2952, 2883, 448, 2852, 3034, 93, 4329, 4152,
        4233, 487, 4069,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Knowledge",
      category: "People and self",
    },
    params: {
      ids: [
        292, 110, 4346, 4197, 119, 640, 4099, 176, 2930, 2858, 2793, 3933, 132,
        4384, 3655,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Abstract",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Knowledge",
      category: "Society and social sciences",
    },
    params: {
      ids: [
        158, 3927, 4148, 609, 2786, 3889, 3862, 639, 3647, 3871, 3929, 400,
        3434, 4091, 570,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Reasoning",
      category: "General reference",
    },
    params: {
      ids: [
        2789, 3315, 959, 708, 4119, 3176, 2730, 3698, 2370, 1935, 3962, 2805,
        3406, 2655, 2297,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Abstract",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Reasoning",
      category: "Society and social sciences",
    },
    params: {
      ids: [
        3050, 4078, 4058, 3885, 3953, 3828, 3764, 4167, 4129, 4064, 240, 4089,
        3576, 3367, 3971,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Knowledge",
      category: "Human activities",
    },
    params: {
      ids: [
        3030, 1743, 589, 1042, 2598, 3375, 3029, 417, 3547, 2903, 2069, 2604,
        2323, 89, 2899,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Fact",
      reasoning: "Reasoning",
      category: "People and self",
    },
    params: {
      ids: [
        2260, 2289, 123, 3117, 1413, 1254, 233, 1443, 2042, 1084, 806, 1362,
        3097, 4397, 2686,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Abstract",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Reasoning",
      category: "People and self",
    },
    params: {
      ids: [
        2711, 2577, 3503, 647, 155, 2101, 1785, 1880, 170, 2693, 3094, 1760,
        623, 2086, 112,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Abstract",
      figure_of_speech: "Literal language",
      judgment: "Positive",
      opinion: "Fact",
      reasoning: "Reasoning",
      category: "General reference",
    },
    params: {
      ids: [
        1234, 4003, 206, 2956, 1348, 340, 166, 3530, 3844, 1310, 3555, 1367,
        543, 129, 4165,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Positive",
      opinion: "Fact",
      reasoning: "Knowledge",
      category: "Natural and physical sciences",
    },
    params: {
      ids: [
        577, 3784, 3374, 585, 521, 2946, 355, 624, 14, 3620, 2947, 4391, 3785,
        189, 633,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Abstract",
      figure_of_speech: "Figure of speech",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Reasoning",
      category: "Philosophy and thinking",
    },
    params: {
      ids: [
        3294, 3522, 548, 529, 2798, 2725, 278, 2384, 2491, 2425, 536, 143, 3701,
        3031, 3665,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Knowledge",
      category: "General reference",
    },
    params: {
      ids: [
        4214, 3045, 2542, 4042, 3385, 2813, 631, 3891, 4169, 4124, 3362, 2435,
        3979, 2342, 3972,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Abstract",
      figure_of_speech: "Figure of speech",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Knowledge",
      category: "Philosophy and thinking",
    },
    params: {
      ids: [
        4331, 2994, 3566, 2543, 2505, 2690, 531, 4155, 3613, 4270, 3604, 2713,
        2625, 3544, 31,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Figure of speech",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Reasoning",
      category: "People and self",
    },
    params: {
      ids: [
        2044, 187, 285, 2815, 2608, 280, 1761, 1611, 3636, 3124, 1978, 1462,
        1703, 1157, 2928,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Fact",
      reasoning: "Reasoning",
      category: "Human activities",
    },
    params: {
      ids: [
        3112, 3185, 1693, 3110, 3456, 3132, 2137, 726, 1072, 2136, 1471, 1689,
        1483, 4195, 2079,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Abstract",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Reasoning",
      category: "Philosophy and thinking",
    },
    params: {
      ids: [
        446, 4237, 2724, 3012, 2699, 3211, 2833, 2562, 401, 3700, 2395, 626,
        3054, 3846, 2396,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Reasoning",
      category: "Health and fitness",
    },
    params: {
      ids: [
        473, 511, 4264, 2917, 3926, 2398, 2357, 2993, 1077, 778, 4123, 1149,
        3646, 2685, 3903,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Abstract",
      figure_of_speech: "Figure of speech",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Reasoning",
      category: "People and self",
    },
    params: {
      ids: [
        3465, 2270, 2809, 380, 1918, 1976, 48, 116, 2416, 4338, 3027, 495, 3229,
        3713, 3524,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Fact",
      reasoning: "Knowledge",
      category: "Human activities",
    },
    params: {
      ids: [
        115, 3489, 2875, 4231, 2925, 3411, 3492, 3147, 3129, 3140, 1051, 3493,
        3494, 3107, 3178,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Fact",
      reasoning: "Reasoning",
      category: "General reference",
    },
    params: {
      ids: [
        2272, 3724, 3621, 636, 12, 142, 2989, 310, 3351, 3402, 2824, 2788, 497,
        3513, 4118,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Positive",
      opinion: "Fact",
      reasoning: "Knowledge",
      category: "Human activities",
    },
    params: {
      ids: [
        3057, 402, 3462, 3419, 3192, 464, 305, 465, 303, 4360, 3490, 2933, 3500,
        3361, 3403,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Reasoning",
      category: "Culture and the arts",
    },
    params: {
      ids: [
        255, 3028, 2226, 4393, 2310, 2320, 3912, 1444, 1732, 989, 4061, 1472,
        4375, 2105, 1325,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Reasoning",
      category: "Philosophy and thinking",
    },
    params: {
      ids: [
        72, 1688, 4314, 430, 662, 3217, 3601, 1919, 4258, 2692, 1863, 2958,
        1715, 443, 148,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Fact",
      reasoning: "Knowledge",
      category: "General reference",
    },
    params: {
      ids: [
        3155, 3160, 4382, 3412, 4062, 3157, 3460, 3069, 3413, 2767, 1909, 4301,
        3391, 563, 3168,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Abstract",
      figure_of_speech: "Literal language",
      judgment: "Positive",
      opinion: "Fact",
      reasoning: "Reasoning",
      category: "Culture and the arts",
    },
    params: {
      ids: [
        857, 1221, 2969, 3976, 1266, 1437, 2955, 2844, 1182, 2848, 876, 1456,
        4277, 481, 789,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Figure of speech",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Reasoning",
      category: "Philosophy and thinking",
    },
    params: {
      ids: [
        2001, 2382, 3817, 3261, 2672, 2622, 666, 561, 2263, 4339, 307, 2245,
        3736, 2411, 2578,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Fact",
      reasoning: "Knowledge",
      category: "General reference",
    },
    params: {
      ids: [
        2324, 333, 3289, 3479, 3189, 3506, 3125, 3416, 4288, 2594, 4300, 3134,
        3422, 3153, 3390,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Abstract",
      figure_of_speech: "Literal language",
      judgment: "Positive",
      opinion: "Opinion",
      reasoning: "Reasoning",
      category: "General reference",
    },
    params: {
      ids: [
        358, 619, 2607, 4075, 1482, 3631, 1270, 371, 3804, 1405, 1417, 252,
        3519, 1109, 1338,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Abstract",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Knowledge",
      category: "General reference",
    },
    params: {
      ids: [
        3325, 2885, 509, 3075, 4303, 459, 3263, 4144, 3791, 418, 3974, 3881,
        3376, 948, 2494,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Positive",
      opinion: "Fact",
      reasoning: "Knowledge",
      category: "Geography and places",
    },
    params: {
      ids: [
        2636, 3618, 3549, 587, 4281, 3552, 3342, 3163, 3341, 4327, 3345, 3595,
        3558, 338, 2287,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Abstract",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Fact",
      reasoning: "Reasoning",
      category: "General reference",
    },
    params: {
      ids: [
        298, 2518, 4221, 1124, 859, 835, 1186, 2504, 937, 2601, 2523, 3711, 819,
        3439, 1419,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Fact",
      reasoning: "Reasoning",
      category: "General reference",
    },
    params: {
      ids: [
        3401, 4298, 3193, 2892, 2774, 2299, 3210, 3835, 2971, 3089, 2317, 2448,
        399, 324, 2517,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Positive",
      opinion: "Fact",
      reasoning: "Knowledge",
      category: "General reference",
    },
    params: {
      ids: [
        18, 273, 3236, 4302, 2389, 3170, 3142, 3070, 3090, 526, 3166, 2397, 270,
        2266, 147,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Abstract",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Reasoning",
      category: "General reference",
    },
    params: {
      ids: [
        117, 3233, 3330, 39, 3242, 635, 3712, 3482, 958, 3742, 2207, 1068, 207,
        3080, 3661,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Abstract",
      figure_of_speech: "Literal language",
      judgment: "Positive",
      opinion: "Fact",
      reasoning: "Knowledge",
      category: "General reference",
    },
    params: {
      ids: [
        2275, 2977, 721, 253, 164, 4232, 2893, 2239, 2470, 332, 2365, 2393, 152,
        3105, 3452,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Abstract",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Reasoning",
      category: "Human activities",
    },
    params: {
      ids: [
        345, 454, 3317, 1865, 412, 1934, 4368, 3265, 852, 2890, 1698, 828, 4385,
        1579, 3829,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Abstract",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Knowledge",
      category: "People and self",
    },
    params: {
      ids: [
        3014, 2290, 3035, 504, 2463, 120, 657, 3816, 3531, 2633, 503, 205, 2768,
        104, 3961,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Knowledge",
      category: "Philosophy and thinking",
    },
    params: {
      ids: [
        3111, 4323, 3807, 2936, 564, 2840, 3900, 3690, 4176, 4317, 1573, 64,
        2035, 2409, 431,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Fact",
      reasoning: "Knowledge",
      category: "People and self",
    },
    params: {
      ids: [
        4208, 86, 96, 2860, 95, 4290, 2462, 4356, 1504, 2907, 1977, 1477, 938,
        357, 1636,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Positive",
      opinion: "Fact",
      reasoning: "Reasoning",
      category: "People and self",
    },
    params: {
      ids: [
        654, 4361, 2743, 765, 131, 1386, 738, 895, 2445, 1380, 1987, 1369, 1337,
        1012, 1668,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Positive",
      opinion: "Fact",
      reasoning: "Reasoning",
      category: "Culture and the arts",
    },
    params: {
      ids: [
        3502, 1502, 821, 4048, 2888, 2399, 2845, 1423, 2441, 1085, 1335, 1429,
        816, 977, 2377,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Abstract",
      figure_of_speech: "Literal language",
      judgment: "Positive",
      opinion: "Fact",
      reasoning: "Reasoning",
      category: "Religion and belief systems",
    },
    params: {
      ids: [
        339, 3833, 3731, 2209, 2414, 2241, 2963, 4060, 1282, 2379, 2481, 1013,
        1333, 1038, 1283,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Abstract",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Knowledge",
      category: "Philosophy and thinking",
    },
    params: {
      ids: [
        2966, 3675, 2898, 490, 507, 3695, 3884, 3196, 2731, 3803, 2640, 3308,
        4085, 203, 645,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Abstract",
      figure_of_speech: "Figure of speech",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Knowledge",
      category: "General reference",
    },
    params: {
      ids: [
        630, 3001, 437, 803, 2495, 2871, 2534, 3773, 4234, 4187, 2274, 3666,
        3574, 3739, 2446,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Abstract",
      figure_of_speech: "Figure of speech",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Reasoning",
      category: "General reference",
    },
    params: {
      ids: [
        2723, 2394, 2347, 2380, 25, 2335, 78, 4188, 476, 2010, 4252, 3003, 723,
        474, 2861,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Fact",
      reasoning: "Reasoning",
      category: "Human activities",
    },
    params: {
      ids: [
        2292, 2476, 46, 910, 2300, 3786, 4070, 3353, 1358, 1014, 291, 3379,
        3743, 888, 1873,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Positive",
      opinion: "Fact",
      reasoning: "Knowledge",
      category: "Health and fitness",
    },
    params: {
      ids: [
        2759, 2540, 3324, 2758, 4181, 35, 524, 522, 3063, 527, 407, 3049, 2785,
        3064, 571,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Positive",
      opinion: "Fact",
      reasoning: "Reasoning",
      category: "Human activities",
    },
    params: {
      ids: [
        689, 3423, 2318, 556, 1350, 1411, 1460, 960, 921, 376, 897, 2008, 4358,
        2009, 311,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Abstract",
      figure_of_speech: "Literal language",
      judgment: "Positive",
      opinion: "Opinion",
      reasoning: "Reasoning",
      category: "Culture and the arts",
    },
    params: {
      ids: [
        3841, 2218, 861, 1056, 735, 781, 1089, 3232, 3301, 787, 1246, 1378,
        1291, 802, 844,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Figure of speech",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Reasoning",
      category: "General reference",
    },
    params: {
      ids: [
        3774, 4276, 2426, 4318, 4066, 113, 2804, 133, 1527, 2326, 2748, 41,
        1231, 463, 881,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Abstract",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Knowledge",
      category: "General reference",
    },
    params: {
      ids: [
        4193, 2659, 1185, 498, 383, 4162, 620, 2591, 3484, 2536, 367, 3855,
        4047, 1407, 2914,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Positive",
      opinion: "Fact",
      reasoning: "Reasoning",
      category: "Health and fitness",
    },
    params: {
      ids: [
        4326, 1010, 1217, 3093, 1798, 2942, 2302, 4380, 438, 4150, 3360, 92,
        472, 1339, 720,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Figure of speech",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Knowledge",
      category: "Philosophy and thinking",
    },
    params: {
      ids: [
        2641, 3569, 3812, 574, 455, 4189, 3328, 2413, 3571, 2697, 3689, 308,
        2706, 648, 54,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Knowledge",
      category: "Health and fitness",
    },
    params: {
      ids: [
        2880, 2295, 486, 4146, 2498, 4340, 4005, 677, 43, 3732, 3397, 3802, 103,
        470, 106,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Positive",
      opinion: "Fact",
      reasoning: "Knowledge",
      category: "Technology and applied sciences",
    },
    params: {
      ids: [
        3614, 19, 346, 2325, 386, 3287, 20, 2330, 4293, 3387, 480, 2791, 2792,
        3388, 2650,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Abstract",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Knowledge",
      category: "Religion and belief systems",
    },
    params: {
      ids: [
        2727, 2457, 4109, 603, 3963, 599, 600, 2583, 3669, 365, 4114, 3332, 505,
        2740, 2339,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Fact",
      reasoning: "Knowledge",
      category: "People and self",
    },
    params: {
      ids: [
        3118, 4354, 3417, 2190, 3198, 1751, 2224, 2632, 3485, 827, 4377, 3126,
        3371, 2169, 1799,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Figure of speech",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Knowledge",
      category: "General reference",
    },
    params: {
      ids: [
        3487, 2506, 3866, 3101, 139, 2444, 2922, 683, 279, 3108, 274, 42, 3746,
        1165, 3720,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Positive",
      opinion: "Fact",
      reasoning: "Reasoning",
      category: "People and self",
    },
    params: {
      ids: [
        286, 2254, 1975, 2022, 79, 1594, 1984, 1410, 1008, 3394, 1721, 1857,
        2201, 1895, 836,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Positive",
      opinion: "Fact",
      reasoning: "Reasoning",
      category: "Human activities",
    },
    params: {
      ids: [
        1651, 370, 1763, 2455, 3182, 1503, 1740, 1564, 1574, 1923, 3809, 1179,
        2235, 1906, 3370,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Abstract",
      figure_of_speech: "Literal language",
      judgment: "Positive",
      opinion: "Fact",
      reasoning: "Reasoning",
      category: "History and events",
    },
    params: {
      ids: [
        57, 4057, 1476, 237, 807, 27, 1366, 4191, 751, 3741, 517, 2839, 1341,
        1111, 1188,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Abstract",
      figure_of_speech: "Literal language",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Reasoning",
      category: "Religion and belief systems",
    },
    params: {
      ids: [
        200, 2364, 2511, 3852, 601, 2658, 2703, 2400, 2443, 2533, 63, 4325, 632,
        2459, 2704,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Physical",
      everyday: "Everyday",
      figure_of_speech: "Literal language",
      judgment: "Positive",
      opinion: "Fact",
      reasoning: "Reasoning",
      category: "General reference",
    },
    params: {
      ids: [
        146, 3252, 2906, 66, 2410, 2934, 1280, 1433, 2836, 3684, 746, 1201,
        3794, 1100, 1153,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
  {
    design_point: {
      behavior: "Social",
      everyday: "Everyday",
      figure_of_speech: "Figure of speech",
      judgment: "Normative",
      opinion: "Opinion",
      reasoning: "Reasoning",
      category: "Culture and the arts",
    },
    params: {
      ids: [
        3453, 1659, 2680, 1123, 1552, 2889, 1805, 2346, 541, 1534, 3772, 179,
        254, 1848, 1727,
      ],
    },
    function: GetStatementById,
    validity: (req, params) => {
      return req.query.source === "mturk";
    },
  },
];

const experiment = {
  experimentName: "design-design_point-old-statements",
  treatments: defaultTreatment,
  treatmentAssigner: (treatments, req) => {
    return treatments[Math.floor(Math.random() * treatments.length)];
  },
};

module.exports = experiment;
