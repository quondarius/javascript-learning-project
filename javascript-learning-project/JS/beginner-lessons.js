window.SPACE_LAB_CHALLENGES = [
  {
    id: "score-trail", topic: "Variables", game: "Score trail", gameEmoji: "🎯", title: "Follow the score",
    lesson: "A variable is a little labeled box. Start at 10, add 2, then look at what gets printed.",
    code: "let score = 10;\nscore = score + 2;\nconsole.log(score);\nscore = score * 3;\nconsole.log(score);",
    referenceTitle: "Variables + printing", referenceCopy: "let makes a changeable box. console.log shows what is inside.",
    referenceCode: "let score = 10;\nscore = score + 2;\nconsole.log(score);",
    referenceTip: "Read one line, update the box, then keep going.",
    questions: [
      { prompt: "The first console.log runs after adding 2. What number appears?", answer: 12, explain: "10 + 2 = 12.", hints: ["Start with the value 10.", "Add the 2 before the first console.log." ] },
      { prompt: "After the score is multiplied by 3, what does the second console.log show?", answer: 36, explain: "The score was 12, and 12 × 3 = 36.", hints: ["Use the score after the first question.", "Multiply 12 by 3." ] }
    ]
  },
  {
    id: "array-signal", topic: "Arrays", game: "Array signal", gameEmoji: "📡", title: "Count the space snacks",
    lesson: "An array is a list. push adds one item to the end, and length tells you how many items are in it.",
    code: "let snacks = [\"apple\", \"mango\"];\nsnacks.push(\"pear\");\nconsole.log(snacks.length);",
    referenceTitle: "A list and its size", referenceCopy: "Square brackets make a list. push adds an item; length counts items.",
    referenceCode: "let snacks = [\"apple\", \"mango\"];\nsnacks.push(\"pear\");\nconsole.log(snacks.length);",
    referenceTip: "Count the original items, then add one for push.",
    questions: [
      { prompt: "After pear is pushed into the list, how many snacks are there?", answer: 3, explain: "There were 2 snacks, and push added 1.", hints: ["Count apple and mango first.", "push adds exactly one new snack." ] },
      { prompt: "If we add one more snack after that, how many will the list have?", answer: 4, explain: "Three snacks plus one more makes four.", hints: ["Start with the 3 from the code.", "Add one to that count." ] }
    ]
  },
  {
    id: "tiny-function", topic: "Functions", game: "Function fuel", gameEmoji: "🚀", title: "Give the ship a fuel boost",
    lesson: "A function is a reusable set of steps. This one adds its two inputs and returns the total.",
    code: "function addFuel(level, bonus) {\n  return level + bonus;\n}\nlet fuel = addFuel(4, 3);\nconsole.log(fuel);",
    referenceTitle: "Functions + return", referenceCopy: "Call a function with values in parentheses. return sends a result back.",
    referenceCode: "function add(a, b) {\n  return a + b;\n}\nconsole.log(add(2, 3));",
    referenceTip: "Match the first input to the first name, then the second.",
    questions: [
      { prompt: "The function gets 4 and 3. What total does it return?", answer: 7, explain: "It adds 4 + 3 and returns 7.", hints: ["Look at the return line.", "Add the two numbers in the function call." ] },
      { prompt: "If the bonus were 5 instead of 3, what total would come back?", answer: 9, explain: "4 + 5 = 9.", hints: ["The level stays 4.", "Use 5 as the new bonus." ] }
    ]
  },
  {
    id: "warm-orbit", topic: "Conditions", game: "Warm-or-cool scan", gameEmoji: "🌡️", title: "Scan the planet’s weather",
    lesson: "An if/else makes a choice. Here, 20 or more counts as warm; less than 20 counts as cool.",
    code: "let temperature = 22;\nif (temperature >= 20) {\n  console.log(\"warm\");\n} else {\n  console.log(\"cool\");\n}",
    referenceTitle: "A simple choice", referenceCopy: "The condition inside if is checked. Only one branch runs.",
    referenceCode: "if (temperature >= 20) {\n  console.log(\"warm\");\n} else {\n  console.log(\"cool\");\n}",
    referenceTip: "22 is greater than or equal to 20, so the first branch runs.",
    questions: [
      { prompt: "The temperature is 22. Which word does the code print?", answer: "warm", explain: "22 is at least 20, so the if branch runs.", hints: ["Check whether 22 is at least 20.", "If the condition is true, the first block runs." ] },
      { prompt: "If temperature changes to 14, which word will print?", answer: "cool", explain: "14 is less than 20, so the else branch runs.", hints: ["14 is below the warm line of 20.", "When the if condition is false, else runs." ] }
    ]
  }
];
