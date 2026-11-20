window.SPACE_LAB_CHALLENGES = [
  {
    id: "filter-map", topic: "Array methods", game: "Array rescue", gameEmoji: "🧲", title: "Keep the high scores",
    lesson: "filter keeps items that pass a test. map makes a new version of each item that remains.",
    code: "let scores = [50, 70, 85];\nlet boosted = scores\n  .filter((score) => score >= 70)\n  .map((score) => score + 5);\nconsole.log(JSON.stringify(boosted));",
    referenceTitle: "filter then map", referenceCopy: "Read left to right: keep matching items, then change each kept item.",
    referenceCode: "scores\n  .filter((score) => score >= 70)\n  .map((score) => score + 5);",
    referenceTip: "Only 70 and 85 pass. Add five to each one.",
    questions: [
      { prompt: "What list is printed after keeping scores of 70+ and adding 5?", answer: "[75,90]", explain: "70 and 85 stay; adding 5 makes 75 and 90.", hints: ["50 is below 70, so it gets filtered out.", "Add 5 to both 70 and 85, then keep their order." ] },
      { prompt: "If we change the filter to score > 70, how many scores stay?", answer: 1, explain: "Only 85 is greater than 70; 70 itself is not.", hints: ["The symbol > means strictly greater than.", "70 does not pass > 70, but 85 does." ] }
    ]
  },
  {
    id: "ship-object", topic: "Objects", game: "Ship manifest", gameEmoji: "🛸", title: "Read the ship’s manifest",
    lesson: "An object stores named details. Destructuring copies the chosen details into easy-to-use variables.",
    code: "const ship = { pilot: \"Mira\", fuel: 80 };\nconst { pilot, fuel } = ship;\nconsole.log(pilot, fuel);",
    referenceTitle: "Object + destructuring", referenceCopy: "Use curly braces with the property names you want to copy out.",
    referenceCode: "const ship = { pilot: \"Mira\", fuel: 80 };\nconst { pilot, fuel } = ship;",
    referenceTip: "The property name on the left matches a name inside the object.",
    questions: [
      { prompt: "What two values does console.log print, in order?", answer: "Mira 80", explain: "pilot is Mira, and fuel is 80.", hints: ["Look up pilot first in the ship object.", "Then look up fuel. console.log prints them in that order." ] },
      { prompt: "If fuel changes to 45, what value will the fuel variable hold?", answer: 45, explain: "Destructuring copies the current fuel property value.", hints: ["The fuel property is the second detail.", "Use the new value from the question." ] }
    ]
  },
  {
    id: "remembering-counter", topic: "Closures", game: "Memory capsule", gameEmoji: "🫙", title: "A counter that remembers",
    lesson: "A closure is a function that remembers a variable from where it was created—even after that place has finished running.",
    code: "function makeCounter() {\n  let count = 0;\n  return function () {\n    count += 1;\n    return count;\n  };\n}\nconst next = makeCounter();\nconsole.log(next());\nconsole.log(next());",
    referenceTitle: "A function that remembers", referenceCopy: "The inner function keeps using count from makeCounter.",
    referenceCode: "function makeCounter() {\n  let count = 0;\n  return () => ++count;\n}",
    referenceTip: "Each call adds one to the same remembered count.",
    questions: [
      { prompt: "What does the first call to next() print?", answer: 1, explain: "count starts at 0, then the call adds one.", hints: ["The starting value is 0.", "The function adds one before it returns." ] },
      { prompt: "What does the second call print?", answer: 2, explain: "The function remembers the 1 from its first call and adds one more.", hints: ["The remembered value does not reset between calls.", "Start from the first result and add one." ] }
    ]
  },
  {
    id: "async-fuel", topic: "Async / await", game: "Promise parcel", gameEmoji: "📦", title: "Wait for the fuel parcel",
    lesson: "An async function can return a value later. await lets us wait for that value in a clear, step-by-step way.",
    code: "async function getFuel() {\n  return 5;\n}\nconst fuel = await getFuel();\nconsole.log(fuel + 2);",
    referenceTitle: "async + await", referenceCopy: "await pauses this async code until the Promise is ready.",
    referenceCode: "async function getNumber() {\n  return 5;\n}\nconst number = await getNumber();",
    referenceTip: "After await, fuel is the number 5.",
    questions: [
      { prompt: "getFuel returns 5. What number is printed after adding 2?", answer: 7, explain: "await gives fuel the value 5; 5 + 2 = 7.", hints: ["After await, use the returned value.", "Add 2 to 5." ] },
      { prompt: "If getFuel returned 8 instead, what would the console print?", answer: 10, explain: "8 + 2 = 10.", hints: ["Only the returned number changes.", "Add the same 2 to 8." ] }
    ]
  }
];
