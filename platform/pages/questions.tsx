export const encodeElements =[
    {
      "name": "filter",
      "type": "radio",
      "title": "How do you think most people would categorize this statement?",
      "description": (<>
        <strong>Clear</strong>: it is clearly written and I can understand the meaning<br/>
        <strong>Confusing</strong>: I don't quite understand what it means, but it seems like it is written correctly<br/>
        <strong>Gibberish</strong>: I don't know what it means, it is gibberish or poorly written so it doesn't make sense
      </>),
      "choices":  ["Clear", " Confusing", "Gibberish"]
    },
    {
      "name": "behavior",
      "type": "radio",
      "title": "Is the above statement about social or physical reality?",
      "description": (<>
        <strong>Social</strong>: it refers to beliefs, perceptions, preferences, and socially constructed rules that govern human experience; it can be “real” or opinion, but is intrinsically of human origins. e.g., I exist and am the same person I was yesterday. He yelled at me because he was angry. There are seven days in the week.<br/>
        <strong>Physical</strong>: it refers to objective features of the world as described by, say, physics, biology, engineering, mathematics or other natural rules; it can be measured empirically, or derived logically. e.g., Men on average are taller than women. The Earth is the third planet from the Sun. Ants are smaller than Elephants.
      </>),
      "choices":  ["Social", "Physical"]
    },
    {
      "name": "judgement",
      "type": "radio",
      "title": "Is the above statement Normative or Positive?",
      "description": (<>
        <strong>Normative</strong>: it refers to a judgment, belief, value, social norm or convention. e.g., If you are going to the office, you should wear business attire,not a bathing suit. Treat others how you want them to treat you. Freedom is a fundamental human right.<br/><strong>Positive</strong>: it refers to something in the world such as an empirical regularity or scientific law, e.g., hot things will burn you; the sun rises in the east and sets in the west.
      </>),
      "choices":  ["Normative", "Positive"]
    },
    {
      "name": "opinion",
      "type": "radio",
      "title": "Is the above statement opinion or factual?",
      "description": (<>
        <strong>Opinion</strong>: it is something that someone might think is true, or wants others to think is true, but can’t be demonstrated to be objectively correct or incorrect; it is inherently subjective. e.g., FDR was the greatest US president of the 20th Century.. The Brooklyn Bridge is prettier than the Golden Gate. Vaccine mandates are a tolerable imposition on individual freedom. <br/>
        <strong>Factual</strong>: it is something that can be demonstrated to be correct or incorrect, independently of anyone’s opinion, e.g., Obama was the 24th president of the United States (this is incorrect, but we know it's incorrect). It will be sunny next Tuesday (we don't yet know if this is correct, but we will be able to check in the future).
      </>),
      "choices":  ["Opinion", "Factual"]
    },
    {
      "name": "everyday",
      "type": "radio",
      "title": "Is the above statement about an everyday, concrete situation or an infrequent, abstract situation?",
      "description": (<>
        <strong>Everyday</strong>: people encounter, or could encounter, situations like this in the course of their ordinary, everyday experiences, e.g., Touching a hot stove will burn you. Commuting at rush hour takes longer. It is rude to jump the line.<br/>
        <strong>Abstract</strong>: this statement refers to regularities or conclusions that cannot be observed or arrived at solely through individual experience, e.g., Capitalism is a better economic system than Communism. Strict gun laws save lives. God exists.
      </>),
      "choices":  ["Everyday", "Abstract"]
    },
    {
      "name": "reasoning",
      "type": "radio",
      "title": "Is the above statement an example of knowledge or reasoning?",
      "description": (<>
        <strong>Knowledge</strong>: the statement refers to some observation about the world; it may be true or false, opinion or fact, subjective or objective e.g., The sun rises in the east and sets in the west. Dogs are nicer than cats. Glasses break when they are dropped.<br/>
        <strong>Reasoning</strong>: the statement presents a conclusion that is arrived at by combining knowledge and logic, e.g., The sun is in the east, therefore it is morning. My dog is wagging its tail, therefore it is happy. The glass fell off the table, therefore it will break and the floor will become wet.
      </>),
      "choices":  ["Knowledge", "Reasoning"]
    },
    {
      "name": "figure_of_speech",
      "type": "radio",
      "title": "Is the statement above metaphorical or literal?",
      "description": (<>
        <strong>Metaphorical</strong>: it contains an aphorism, metaphor, or figure of speech, e.g., Birds of a feather flock together. A stitch in time saves nine.<br/>
        <strong>Literal</strong>: it is plain and ordinary language that means exactly what it says. e.g. The sky is blue. Elephants are larger than dogs. Abraham Lincoln was a great president.
      </>),
      "choices":  ["Metaphorical", "Literal"]
    },
    {
      "name": "knowledge-statements",
      "type": "checkbox",
      "title": "Which knowledge category or categories describe this statement?",
      "choices":  ["General reference", "Culture and the arts", "Geography and places", "Health and fitness", "History and events", "Human activities", "Mathematics and logic", "Natural and physical sciences", "People and self", "Philosophy and thinking", "Religion and belief systems", "Society and social sciences", "Technology and applied sciences"]
    },
  ]

