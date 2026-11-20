window.SPACE_LAB_CHALLENGES = [
  {
    id: "closure-gate", topic: "Closures", game: "Threshold gate", gameEmoji: "🚪", title: "A gate that remembers its rule",
    lesson: "makeGate remembers the minimum score. The returned function can use that remembered number later.",
    code: "function makeGate(minimum) {\n  return function (score) {\n    return score >= minimum;\n  };\n}\nconst ready = makeGate(70);\nconsole.log(ready(83));\nconsole.log(ready(60));",
    referenceTitle: "Closures remember", referenceCopy: "A returned inner function can keep using the outer function’s variables.",
    referenceCode: "function makeGate(minimum) {\n  return (score) => score >= minimum;\n}\nconst ready = makeGate(70);",
    referenceTip: "The gate remembers 70 each time ready is called.",
    questions: [
      { prompt: "Does ready(83) pass the gate? Type true or false.", answer: true, explain: "83 is at least 70, so the gate returns true.", hints: ["The remembered minimum is 70.", "Compare 83 with 70." ] },
      { prompt: "Does ready(60) pass the same gate? Type true or false.", answer: false, explain: "60 is below the remembered minimum of 70.", hints: ["The gate keeps the same minimum.", "Compare 60 with 70." ] }
    ]
  },
  {
    id: "pipeline-total", topic: "Data pipeline", game: "Pipeline pilot", gameEmoji: "🧪", title: "Follow the data through the pipes",
    lesson: "filter keeps the matching records, map changes each one, and reduce combines the changed values into one total.",
    code: "const items = [\n  { name: \"Comet\", points: 2 },\n  { name: \"Nova\", points: 5 },\n  { name: \"Pip\", points: 1 }\n];\nconst total = items\n  .filter((item) => item.points >= 2)\n  .map((item) => item.points * 2)\n  .reduce((sum, points) => sum + points, 0);\nconsole.log(total);",
    referenceTitle: "filter → map → reduce", referenceCopy: "Filter chooses records; map transforms them; reduce folds them into one result.",
    referenceCode: "items\n  .filter((item) => item.points >= 2)\n  .map((item) => item.points * 2)\n  .reduce((sum, points) => sum + points, 0);",
    referenceTip: "Comet and Nova stay. Double their points, then add them.",
    questions: [
      { prompt: "After filtering, which records stay: Comet, Nova, Pip, or some of them?", answer: "Comet, Nova", explain: "Comet has 2 and Nova has 5; Pip has only 1.", hints: ["The filter keeps points >= 2.", "Check each points value against 2." ] },
      { prompt: "What final total does reduce print after the kept points are doubled?", answer: 14, explain: "Comet gives 4, Nova gives 10, and 4 + 10 = 14.", hints: ["First double 2 and 5.", "Then add those doubled values together." ] }
    ]
  },
  {
    id: "promise-order", topic: "Async timing", game: "Event-order puzzle", gameEmoji: "⏱️", title: "Put the events in order",
    lesson: "Synchronous code runs first. A Promise callback runs next, and code after await continues after that Promise finishes.",
    code: "const steps = [];\nconst ready = Promise.resolve().then(() => steps.push(\"promise\"));\nsteps.push(\"now\");\nawait ready;\nsteps.push(\"after\");\nconsole.log(steps.join(\" → \"));",
    referenceTitle: "Sync, then Promise", referenceCopy: "Normal code runs now. Promise callbacks wait until the current synchronous work is done.",
    referenceCode: "const ready = Promise.resolve().then(() => {\n  console.log(\"promise\");\n});\nconsole.log(\"now\");\nawait ready;",
    referenceTip: "The word now is pushed before the Promise callback runs.",
    questions: [
      { prompt: "Which word gets added to steps first?", answer: "now", explain: "The synchronous push runs before the Promise callback.", hints: ["Find the push that is not inside a callback.", "That line runs right away, before await." ] },
      { prompt: "What full order prints? Type: now, promise, after", answer: "now → promise → after", explain: "Synchronous code, then the Promise callback, then code after await.", hints: ["The Promise is awaited before after is pushed.", "Keep the first word, then the Promise’s word, then the last word." ] }
    ]
  },
  {
    id: "promise-fallback", topic: "Error recovery", game: "Fallback finder", gameEmoji: "🛟", title: "Recover when a Promise rejects",
    lesson: "When an awaited Promise rejects, JavaScript jumps to catch. The catch block can return a safe fallback.",
    code: "async function loadFuel() {\n  try {\n    return await Promise.reject(new Error(\"offline\"));\n  } catch (error) {\n    return \"backup\";\n  }\n}\nconsole.log(await loadFuel());",
    referenceTitle: "try, catch, fallback", referenceCopy: "A rejected Promise jumps to catch, where you can choose a safe result.",
    referenceCode: "try {\n  return await loadData();\n} catch (error) {\n  return \"backup\";\n}",
    referenceTip: "The rejection skips the return in try and enters catch.",
    questions: [
      { prompt: "What word does loadFuel print after the Promise rejects?", answer: "backup", explain: "The catch block returns the fallback word.", hints: ["The Promise does not fulfill with data.", "Follow the catch block’s return value." ] },
      { prompt: "Does the word offline reach the console? Type yes or no.", answer: "no", explain: "The rejection message is caught; the function returns backup instead.", hints: ["The error is handled inside catch.", "Only the function's returned value is logged." ] }
    ]
  }
];
