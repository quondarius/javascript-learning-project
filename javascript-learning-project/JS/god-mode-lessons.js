window.SPACE_LAB_CHALLENGES = [
  {
    id: "boss-closure-pipeline", topic: "Closure + pipeline", game: "Boss: filter field", gameEmoji: "🛡️", title: "A remembered rule meets a data stream",
    lesson: "A closure remembers the minimum. The returned rule then helps filter a list of records.",
    code: "function makeRule(minimum) {\n  return (record) => record.points >= minimum;\n}\nconst keep = makeRule(4);\nconst crew = [\n  { name: \"Nova\", points: 5 },\n  { name: \"Pip\", points: 2 },\n  { name: \"Orion\", points: 7 }\n];\nconsole.log(crew.filter(keep).map((record) => record.name).join(\", \"));",
    referenceTitle: "A closure as a filter", referenceCopy: "Create a rule once; pass that remembered rule to array.filter.",
    referenceCode: "const keep = makeRule(4);\nconst winners = crew.filter(keep);",
    referenceTip: "The rule remembers 4, so records need 4 or more points.",
    questions: [
      { prompt: "Which crew names remain after the filter? Type them in order, separated by a comma.", answer: "Nova, Orion", explain: "Nova has 5 points and Orion has 7; Pip is below 4.", hints: ["The minimum stays 4.", "Check the points in order: 5, 2, 7." ] },
      { prompt: "If the minimum becomes 6, how many crew members remain?", answer: 1, explain: "Only Orion has at least 6 points.", hints: ["Check each crew member against 6.", "Only 7 is at least 6." ] }
    ]
  },
  {
    id: "boss-async-order", topic: "Async order", game: "Boss: timeline", gameEmoji: "⏳", title: "Sync the whole launch timeline",
    lesson: "Synchronous code runs immediately. A Promise callback runs before the line after await continues.",
    code: "const timeline = [];\nasync function launch() {\n  timeline.push(\"launch\");\n  await Promise.resolve().then(() => timeline.push(\"signal\"));\n  timeline.push(\"orbit\");\n  return timeline.join(\" > \");\n}\nconsole.log(await launch());",
    referenceTitle: "await means wait", referenceCopy: "The async function pauses at await until its Promise work is done.",
    referenceCode: "timeline.push(\"launch\");\nawait sendSignal();\ntimeline.push(\"orbit\");",
    referenceTip: "The signal callback runs while launch is paused.",
    questions: [
      { prompt: "What gets added to the timeline first?", answer: "launch", explain: "That push is synchronous and happens before the await.", hints: ["Look at the first push inside launch.", "It happens before any Promise work is awaited." ] },
      { prompt: "What full order appears? Type: launch > signal > orbit", answer: "launch > signal > orbit", explain: "Launch starts, signal resolves, then execution continues to orbit.", hints: ["The signal is inside the Promise callback.", "orbit comes after await finishes." ] }
    ]
  },
  {
    id: "boss-fallback-map", topic: "Recovery + transformation", game: "Boss: backup crew", gameEmoji: "🧰", title: "Recover data, then transform it",
    lesson: "Catch a rejected request, return backup data, then map makes a new list from each recovered item.",
    code: "async function loadCrew() {\n  try {\n    return await Promise.reject(new Error(\"offline\"));\n  } catch (error) {\n    return [\"Nova\", \"Pip\"];\n  }\n}\nconst crew = await loadCrew();\nconsole.log(crew.map((name) => name.toUpperCase()).join(\", \"));",
    referenceTitle: "Catch, recover, map", referenceCopy: "catch can return safe data. The next line can transform that data.",
    referenceCode: "try {\n  return await loadCrew();\n} catch (error) {\n  return [\"Nova\", \"Pip\"];\n}\ncrew.map((name) => name.toUpperCase());",
    referenceTip: "The request fails, so the backup names are used.",
    questions: [
      { prompt: "Which two names come back as the backup crew?", answer: "Nova, Pip", explain: "The catch block returns the backup list.", hints: ["A rejected request jumps into catch.", "Read the array returned by catch." ] },
      { prompt: "After uppercasing, what text is printed?", answer: "NOVA, PIP", explain: "map changes each name to uppercase, then join puts them together.", hints: ["Each name changes separately.", "Join the uppercase names with a comma and a space." ] }
    ]
  },
  {
    id: "boss-async-counter", topic: "Closure + async state", game: "Boss: memory core", gameEmoji: "🧠", title: "An async counter with a memory core",
    lesson: "The returned async function remembers total. Each awaited call adds its number and returns the new total.",
    code: "function makeRecorder() {\n  let total = 0;\n  return async function add(points) {\n    await Promise.resolve();\n    total += points;\n    return total;\n  };\n}\nconst add = makeRecorder();\nconsole.log(await add(3));\nconsole.log(await add(4));",
    referenceTitle: "Remembered async state", referenceCopy: "A closure keeps total between calls, even when the inner function is async.",
    referenceCode: "function makeRecorder() {\n  let total = 0;\n  return async (points) => {\n    total += points;\n    return total;\n  };\n}",
    referenceTip: "The second call starts from the total left by the first.",
    questions: [
      { prompt: "What does the first await add(3) print?", answer: 3, explain: "The remembered total starts at 0, then adds 3.", hints: ["Start from total = 0.", "Add the first call’s 3 points." ] },
      { prompt: "What does the second await add(4) print?", answer: 7, explain: "The total remembers 3, then adds 4 more.", hints: ["The counter does not reset between calls.", "Add 4 to the previous result." ] }
    ]
  }
];
