(() => {
  "use strict";

  const LAST_SET_KEY = "spaceLab.intermediate.lastQuestionSet.v1";
  const editor = document.getElementById("codeEditor");
  const output = document.getElementById("outputBody");
  const status = document.getElementById("runStatus");
  const frame = document.getElementById("runner");
  const questionContainer = document.getElementById("questionsContainer");
  const exerciseTopic = document.getElementById("exerciseTopic");
  const conceptTitle = document.getElementById("conceptTitle");
  const conceptText = document.getElementById("conceptText");
  const setProgress = document.getElementById("setProgress");
  const nextSetButton = document.getElementById("nextSetBtn");
  let pendingRunId = 0;
  let currentSet = null;
  let solvedCount = 0;

  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (items) => items[Math.floor(Math.random() * items.length)];

  function shuffle(items) {
    const mixed = items.slice();
    for (let index = mixed.length - 1; index > 0; index -= 1) {
      const other = Math.floor(Math.random() * (index + 1));
      [mixed[index], mixed[other]] = [mixed[other], mixed[index]];
    }
    return mixed;
  }

  const topicNotes = {
    arrays: {
      title: "Array methods · transform, select, combine",
      text: "map makes a new array by changing each item; filter keeps items that pass a test; reduce combines items into one value. The original array stays available."
    },
    objects: {
      title: "Objects · named values and destructuring",
      text: "An object stores related values under property names. Destructuring copies chosen properties into variables; a default can fill in when a property is missing."
    },
    closures: {
      title: "Scope and closures · remembered variables",
      text: "Scope decides where a variable can be used. A function returned from another function can keep access to the outer variables it was created with."
    },
    callbacks: {
      title: "Callbacks · functions passed as values",
      text: "A callback is a function passed into another function. The receiving function decides when to call it and what value to give it."
    },
    async: {
      title: "Promises and async/await · later results",
      text: "A Promise stands for a result that may arrive later. An async function can await that result; .then() is another way to work with it."
    }
  };

  function makeSet(id, topic, code, questions) {
    const randomizedQuestions = shuffle(questions);
    return {
      id,
      topic,
      code,
      questions: randomizedQuestions,
      signature: JSON.stringify([id, code, randomizedQuestions.map((question) => question.prompt)])
    };
  }

  const setBuilders = [
    () => {
      const values = [randomInt(2, 7), randomInt(4, 10), randomInt(7, 13)];
      const bonus = randomInt(1, 5);
      const adjusted = values.map((value) => value + bonus);
      const code = `const values = [${values.join(", ")}];\nconst adjusted = values.map(value => value + ${bonus});\nconsole.log(adjusted);\nconsole.log(values);`;
      return makeSet("arrays-map", "Arrays · map", code, [
        { prompt: "What is adjusted[1] after map runs?", answer: adjusted[1] },
        { prompt: "How many items are in adjusted?", answer: adjusted.length },
        { prompt: "What is the first value in the original values array?", answer: values[0] }
      ]);
    },
    () => {
      const temperatures = [randomInt(12, 16), randomInt(18, 22), randomInt(23, 27), randomInt(29, 35)];
      const minimum = randomInt(20, 25);
      const warm = temperatures.filter((temperature) => temperature >= minimum);
      const code = `const temperatures = [${temperatures.join(", ")}];\nconst warm = temperatures.filter(temperature => temperature >= ${minimum});\nconsole.log(warm);\nconsole.log(warm.length);`;
      return makeSet("arrays-filter", "Arrays · filter", code, [
        { prompt: `How many temperatures are at least ${minimum}?`, answer: warm.length },
        { prompt: "What is the first value in warm?", answer: warm[0] },
        { prompt: "How many values were in the original temperatures array?", answer: temperatures.length }
      ]);
    },
    () => {
      const costs = [randomInt(3, 12), randomInt(5, 15), randomInt(2, 10)];
      const total = costs.reduce((sum, cost) => sum + cost, 0);
      const code = `const costs = [${costs.join(", ")}];\nconst total = costs.reduce((sum, cost) => sum + cost, 0);\nconsole.log(total);`;
      return makeSet("arrays-reduce", "Arrays · reduce", code, [
        { prompt: "What number is stored in total?", answer: total },
        { prompt: "How many costs are combined?", answer: costs.length },
        { prompt: "What is the last cost in the array?", answer: costs[costs.length - 1] }
      ]);
    },
    () => {
      const pilot = pick(["Mira", "Jules", "Ari", "Sana"]);
      const planet = pick(["Europa", "Titan", "Mars", "Neptune"]);
      const moons = randomInt(1, 8);
      const code = `const mission = { pilot: ${JSON.stringify(pilot)}, planet: ${JSON.stringify(planet)}, moons: ${moons} };\nconst { pilot: commander, planet, moons } = mission;\nconsole.log(commander);\nconsole.log(planet);\nconsole.log(moons);`;
      return makeSet("objects-destructure", "Objects · destructuring", code, [
        { prompt: "What value is stored in commander?", answer: pilot },
        { prompt: "Which planet was pulled out of mission?", answer: planet },
        { prompt: "How many moons are stored in mission?", answer: moons }
      ]);
    },
    () => {
      const item = pick(["water", "samples", "batteries", "maps"]);
      const count = randomInt(2, 9);
      const code = `const cargo = { item: ${JSON.stringify(item)}, count: ${count} };\nconst { item, count, priority = "standard" } = cargo;\nconsole.log(item);\nconsole.log(count);\nconsole.log(priority);`;
      return makeSet("objects-default", "Objects · default values", code, [
        { prompt: "What word is stored in priority?", answer: "standard" },
        { prompt: "What is the cargo count?", answer: count },
        { prompt: "What kind of cargo is listed?", answer: item }
      ]);
    },
    () => {
      const ship = pick(["Orion", "Pioneer", "Voyager"]);
      const callsign = pick(["Nova", "Comet", "Echo", "Orbit"]);
      const code = `const spacecraft = { name: ${JSON.stringify(ship)}, pilot: { callsign: ${JSON.stringify(callsign)} } };\nconst { name, pilot: { callsign: pilotName } } = spacecraft;\nconsole.log(name);\nconsole.log(pilotName);`;
      return makeSet("objects-nested", "Objects · nested values", code, [
        { prompt: "What value is stored in pilotName?", answer: callsign },
        { prompt: "What is the spacecraft name?", answer: ship },
        { prompt: "What is the length of the pilot callsign?", answer: callsign.length }
      ]);
    },
    () => {
      const start = randomInt(1, 8);
      const step = randomInt(2, 5);
      const code = `function makeCounter(start, step) {\n  let count = start;\n  return function next() {\n    count += step;\n    return count;\n  };\n}\nconst nextCount = makeCounter(${start}, ${step});\nconsole.log(nextCount());\nconsole.log(nextCount());\nconsole.log(nextCount());`;
      return makeSet("closures-counter", "Closures · counter", code, [
        { prompt: "What number does the first call to nextCount() return?", answer: start + step },
        { prompt: "What number does the second call return?", answer: start + step * 2 },
        { prompt: "What number does the third call return?", answer: start + step * 3 }
      ]);
    },
    () => {
      const factor = randomInt(2, 5);
      const value = randomInt(3, 11);
      const code = `function makeMultiplier(factor) {\n  return function multiply(value) {\n    return value * factor;\n  };\n}\nconst tripleOrMore = makeMultiplier(${factor});\nconsole.log(tripleOrMore(${value}));\nconsole.log(tripleOrMore(${value + 1}));`;
      return makeSet("closures-multiplier", "Closures · remembered setting", code, [
        { prompt: `What does tripleOrMore(${value}) return?`, answer: factor * value },
        { prompt: `What does tripleOrMore(${value + 1}) return?`, answer: factor * (value + 1) },
        { prompt: "What factor does the returned function remember?", answer: factor }
      ]);
    },
    () => {
      const step = randomInt(2, 6);
      const code = `function makePositionTracker(step) {\n  let position = 0;\n  return () => {\n    position += step;\n    return position;\n  };\n}\nconst move = makePositionTracker(${step});\nconsole.log(move());\nconsole.log(move());\nconsole.log(move());`;
      return makeSet("closures-position", "Closures · saved position", code, [
        { prompt: "What position does move() return the first time?", answer: step },
        { prompt: "What position does it return the second time?", answer: step * 2 },
        { prompt: "What position does it return the third time?", answer: step * 3 }
      ]);
    },
    () => {
      const starting = randomInt(4, 12);
      const bonus = randomInt(2, 8);
      const code = `function applyTo(value, callback) {\n  return callback(value);\n}\nconst starting = ${starting};\nconst result = applyTo(starting, value => value + ${bonus});\nconsole.log(result);\nconsole.log(starting);`;
      return makeSet("callbacks-transform", "Callbacks · transform a value", code, [
        { prompt: "What number is stored in result?", answer: starting + bonus },
        { prompt: "What is still stored in starting?", answer: starting },
        { prompt: "How much does the callback add?", answer: bonus }
      ]);
    },
    () => {
      const values = [randomInt(1, 8), randomInt(2, 9), randomInt(3, 10)];
      const amount = randomInt(2, 5);
      const total = values.reduce((sum, value) => sum + value * amount, 0);
      const code = `const signals = [${values.join(", ")}];\nlet total = 0;\nsignals.forEach(signal => {\n  total += signal * ${amount};\n});\nconsole.log(total);\nconsole.log(signals.length);`;
      return makeSet("callbacks-foreach", "Callbacks · forEach", code, [
        { prompt: "What value is stored in total after forEach finishes?", answer: total },
        { prompt: "How many signals does forEach visit?", answer: values.length },
        { prompt: "What is the second signal value?", answer: values[1] }
      ]);
    },
    () => {
      const a = randomInt(3, 15);
      const b = randomInt(4, 13);
      const code = `function combine(a, b, callback) {\n  return callback(a, b);\n}\nconst answer = combine(${a}, ${b}, (left, right) => left * right);\nconsole.log(answer);`;
      return makeSet("callbacks-combine", "Callbacks · choose the operation", code, [
        { prompt: "What number is stored in answer?", answer: a * b },
        { prompt: "What is the first number given to combine?", answer: a },
        { prompt: "What is the second number given to combine?", answer: b }
      ]);
    },
    () => {
      const energy = randomInt(10, 40);
      const bonus = randomInt(3, 12);
      const code = `const energyReady = Promise.resolve(${energy});\nconst finalEnergy = await energyReady.then(amount => amount + ${bonus});\nconsole.log(finalEnergy);`;
      return makeSet("async-promise-then", "Promises · then", code, [
        { prompt: "What number is logged as finalEnergy?", answer: energy + bonus },
        { prompt: "What value does energyReady resolve to?", answer: energy },
        { prompt: "How much energy is added in then()?", answer: bonus }
      ]);
    },
    () => {
      const distance = randomInt(3, 18);
      const multiplier = randomInt(2, 5);
      const code = `async function getTravelDistance(distance, multiplier) {\n  const readyDistance = await Promise.resolve(distance);\n  return readyDistance * multiplier;\n}\nconst result = await getTravelDistance(${distance}, ${multiplier});\nconsole.log(result);`;
      return makeSet("async-await-value", "Async/await · wait for a value", code, [
        { prompt: "What number is stored in result?", answer: distance * multiplier },
        { prompt: "What distance is passed to the function?", answer: distance },
        { prompt: "What multiplier is used?", answer: multiplier }
      ]);
    },
    () => {
      const signal = pick(["ready", "orbit", "launch", "clear"]);
      const code = `async function readSignal() {\n  const message = await Promise.resolve(${JSON.stringify(signal)});\n  return message + "!";\n}\nconst received = await readSignal();\nconsole.log(received);`;
      return makeSet("async-await-message", "Async/await · return a message", code, [
        { prompt: "What string is stored in received?", answer: `${signal}!` },
        { prompt: "What signal does the Promise provide before the exclamation mark?", answer: signal },
        { prompt: "How many characters are in received?", answer: signal.length + 1 }
      ]);
    }
  ];

  function readPreviousSignature() {
    try { return window.localStorage.getItem(LAST_SET_KEY) || ""; }
    catch (error) { return ""; }
  }

  function generateQuestionSet() {
    const previousSignature = readPreviousSignature();
    let generated;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      generated = pick(setBuilders)();
      if (generated.signature !== previousSignature) break;
    }
    if (generated.signature === previousSignature) {
      const otherBuilder = pick(setBuilders.filter((builder) => builder().signature !== previousSignature));
      if (otherBuilder) generated = otherBuilder();
    }
    try { window.localStorage.setItem(LAST_SET_KEY, generated.signature); }
    catch (error) { /* The practice still works if browser storage is disabled. */ }
    return generated;
  }

  function setOutput(text, isError = false) {
    output.textContent = text;
    output.classList.toggle("output-error", isError);
  }

  function getHintSequence(setId, prompt) {
    const q = prompt.toLowerCase();
    const hints = {
      "arrays-map": q.includes("adjusted[1]")
        ? ["map makes a new array by applying its callback to every original value.", "Array index 1 means the second value; apply the callback's addition to that value.", "Use the second input item and the + operation shown in the callback."]
        : q.includes("original")
          ? ["map creates a second array; it does not overwrite the source array.", "Look at the first entry before map runs.", "The first array index is 0; read it from values, not adjusted."]
          : ["map makes one output item for each input item.", "Count the entries in the starting values array.", "No items are added or removed by map."] ,
      "arrays-filter": q.includes("how many")
        ? ["filter tests each temperature against the >= condition.", "Keep only the entries that pass; rejected values are left out.", "Count the entries in the filtered array, not the source array."]
        : q.includes("first value")
          ? ["warm contains only temperatures that pass the condition.", "Read the source from left to right and find its first matching value.", "The first result is the earliest source item at or above the threshold."]
          : ["filter makes a new array; it leaves the original temperatures array alone.", "Count the entries in the original declaration.", "Filtering changes which values are selected, not how many were originally listed."] ,
      "arrays-reduce": q.includes("total")
        ? ["reduce carries an accumulator from one item to the next.", "Start from 0 and add each cost once.", "Track the running sum after the first, second, and third cost."]
        : q.includes("how many")
          ? ["reduce combines values, but costs is still the original array.", "Count the comma-separated entries in the declaration.", "The question asks about the source list's length, not the sum."]
          : ["The last item is at the end of the original costs array.", "Use the final array position: its index is one less than its length.", "Read the last number in the array literal; no addition is needed."] ,
      "objects-destructure": q.includes("commander")
        ? ["Destructuring copies a named property into a local variable.", "In pilot: commander, pilot is the object property and commander is the new local name.", "Find mission.pilot and follow that value to commander."]
        : q.includes("planet")
          ? ["planet is copied from a property of the mission object.", "Read the value assigned to mission.planet.", "The variable name matches the property name here."]
          : ["moons is one of the named properties inside mission.", "Read the moons property in the object literal.", "Destructuring copies it; it does not calculate a new number."] ,
      "objects-default": q.includes("priority")
        ? ["A destructuring default is used if the object has no value for that property.", "Check cargo for a priority property; if it is absent, follow the default after =.", "Compare the object's keys with the names being destructured."]
        : q.includes("count")
          ? ["count is copied from the cargo object's count property.", "Find count in the cargo object literal.", "There is no arithmetic in this question; trace the property value."]
          : ["item is copied from the cargo object's item property.", "Find the item key and follow its assigned string.", "Destructuring keeps the property's value unchanged."] ,
      "objects-nested": q.includes("pilotname")
        ? ["pilot is itself an object inside spacecraft.", "Follow the nested path spacecraft.pilot.callsign.", "The inner callsign property is renamed to pilotName."]
        : q.includes("length")
          ? ["callsign is a string, and strings have a length property.", "Count the letters in the callsign value, one by one.", "Do not count the quote marks around the string."]
          : ["name is a top-level property of spacecraft.", "Find the name key in the spacecraft object.", "No nested object is involved in this property."] ,
      "closures-counter": q.includes("first")
        ? ["nextCount remembers count inside makeCounter.", "Each call adds step before returning the count.", "Start at the supplied value and add one step for the first call."]
        : q.includes("second")
          ? ["The closure keeps the updated count between calls.", "After the first call, add one more step for the second call.", "Do not reset count when nextCount is called again."]
          : ["Each call uses the same remembered count.", "Continue adding step once per call from the previous result.", "For the third call, count has advanced three times from its start."] ,
      "closures-multiplier": q.includes("factor")
        ? ["makeMultiplier closes over the factor parameter.", "The returned function can still access the factor from its outer function.", "Look at the value supplied when makeMultiplier is called."]
        : ["The returned function multiplies its input by its remembered factor.", "Use the number inside the function call and the factor captured outside it.", "This closure reuses the same factor for each call."] ,
      "closures-position": q.includes("first")
        ? ["move remembers position between calls.", "It adds step before it returns position.", "For the first call, add one step to the starting position of 0."]
        : q.includes("second")
          ? ["The closure does not reset position after returning it.", "The second call adds one more step to the first result.", "Keep a running total of step-sized moves."]
          : ["Each call increases the remembered position by step.", "Continue the running total for one more call.", "Count three step increments from the starting position of 0."] ,
      "callbacks-transform": q.includes("result")
        ? ["applyTo calls the callback with starting as its input.", "The callback adds a fixed bonus to the value it receives.", "Use starting plus the amount after the + sign in the callback."]
        : q.includes("starting")
          ? ["The callback receives a value, but this code does not assign back to starting.", "Look for an assignment to starting; notice whether one occurs.", "A returned result is stored in result, separately from starting."]
          : ["The callback is the arrow function passed as the third argument.", "Read the number added after the + sign.", "The callback adds one fixed amount to its input."] ,
      "callbacks-foreach": q.includes("total")
        ? ["forEach calls its callback once for each signal.", "Each visit adds signal multiplied by the fixed amount to total.", "Calculate each product, then add those products together."]
        : q.includes("how many")
          ? ["forEach visits every entry in signals exactly once.", "Count the entries in the array literal.", "The callback does not add or remove array items."]
          : ["The second item has index 1 because array indexes begin at 0.", "Read the second number in the signals array.", "This asks for a source value, not the running total."] ,
      "callbacks-combine": q.includes("answer")
        ? ["combine passes both values to the callback you gave it.", "The callback uses multiplication, not addition.", "Multiply the two arguments supplied to combine."]
        : q.includes("first")
          ? ["The first argument appears in the call to combine.", "Read the value before the comma in that call.", "It is passed directly; the callback does not change it first."]
          : ["The second argument appears after the comma in combine's call.", "Read the value after the comma.", "It is passed directly to the callback as its second input."] ,
      "async-promise-then": q.includes("finalenergy")
        ? ["The Promise resolves to an initial amount, then .then() receives it.", "Inside then, the callback adds a fixed bonus.", "Follow the resolved amount through the + operation."]
        : q.includes("resolve")
          ? ["Promise.resolve is given its value right in the parentheses.", "Read the number passed to Promise.resolve.", "No callback changes the value until then() runs."]
          : ["The then callback adds one fixed amount to the resolved value.", "Find the number after the + sign in the callback.", "The bonus is the add-on, not the starting energy."] ,
      "async-await-value": q.includes("result")
        ? ["await gets the resolved distance before the function returns.", "The function multiplies that value by its multiplier parameter.", "Use distance × multiplier, then follow the returned value into result."]
        : q.includes("distance")
          ? ["The first argument in the call is the distance.", "Read the number before the comma in getTravelDistance(...).", "It is passed into the function without being changed first."]
          : ["The second argument in the call is the multiplier.", "Read the number after the comma in getTravelDistance(...).", "This is the factor used by the multiplication."] ,
      "async-await-message": q.includes("received")
        ? ["await gets the string from the resolved Promise.", "The function adds one punctuation mark after that string.", "Combine the original signal text with the string added in the return line."]
        : q.includes("signal")
          ? ["The Promise is created from the string inside Promise.resolve(...).", "Read the quoted text passed to Promise.resolve.", "The exclamation mark is added later, not inside the Promise."]
          : ["received contains the resolved signal plus one extra punctuation character.", "Count the letters in the signal, then include the appended mark.", "Do not count quotes or spaces; there are no spaces in the final text."]
    };
    return hints[setId] || ["Trace the value through the code from its starting point.", "Look for the callback or function that changes or returns the value.", "Follow one operation at a time, then check the question's requested variable."];
  }

  function resetConsole() {
    status.textContent = "Ready";
    output.classList.remove("output-error");
    output.innerHTML = '<span class="output-placeholder">Run the example to see what console.log prints.</span>';
  }

  // Run learner edits in a script-only sandboxed frame, separate from this page.
  frame.srcdoc = `<!doctype html><meta charset="utf-8"><script>
    addEventListener("message", async (event) => {
      if (event.source !== parent || !event.data || event.data.type !== "run") return;
      const { id, code } = event.data;
      const lines = [];
      const safeText = (value) => {
        if (typeof value === "string") return value;
        if (value === undefined) return "undefined";
        try { const result = JSON.stringify(value); return result === undefined ? String(value) : result; }
        catch (error) { return String(value); }
      };
      const capturedConsole = {
        log: (...values) => lines.push(values.map(safeText).join(" ")),
        warn: (...values) => lines.push("Warning: " + values.map(safeText).join(" ")),
        error: (...values) => lines.push("Error: " + values.map(safeText).join(" "))
      };
      try {
        const execute = new Function("console", "return (async () => {\\n" + String(code) + "\\n})()");
        await execute(capturedConsole);
        parent.postMessage({ type: "result", id, lines }, "*");
      } catch (error) {
        parent.postMessage({ type: "error", id, message: error && error.message ? error.message : String(error) }, "*");
      }
    });
  <\/script>`;

  document.getElementById("runBtn").addEventListener("click", () => {
    const id = ++pendingRunId;
    status.textContent = "Running…";
    setOutput("");
    frame.contentWindow.postMessage({ type: "run", id, code: editor.value }, "*");
  });

  window.addEventListener("message", (event) => {
    if (event.source !== frame.contentWindow || !event.data || event.data.id !== pendingRunId) return;
    const data = event.data;
    if (data.type === "error") {
      status.textContent = "Needs a fix";
      setOutput(`Error: ${data.message}`, true);
      return;
    }
    status.textContent = "Finished";
    setOutput(data.lines.length ? data.lines.join("\n") : "(No console output)");
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    if (!currentSet) return;
    editor.value = currentSet.code;
    resetConsole();
    editor.focus();
  });

  function answerIsCorrect(rawAnswer, expected) {
    const answer = rawAnswer.trim();
    if (!answer) return false;
    if (typeof expected === "number") return Number.isFinite(Number(answer)) && Number(answer) === expected;
    if (typeof expected === "boolean") return answer.toLowerCase() === String(expected);
    if (typeof expected === "string") {
      const quoted = (answer.startsWith("\"") && answer.endsWith("\"")) || (answer.startsWith("'") && answer.endsWith("'"));
      return (quoted ? answer.slice(1, -1) : answer) === expected;
    }
    return false;
  }

  function renderQuestions(set) {
    currentSet = set;
    solvedCount = 0;
    editor.value = set.code;
    resetConsole();
    exerciseTopic.textContent = set.topic;
    conceptTitle.textContent = topicNotes[set.id.split("-")[0]].title;
    conceptText.textContent = topicNotes[set.id.split("-")[0]].text;
    setProgress.textContent = `0 of ${set.questions.length} correct — answer every question to unlock a fresh set.`;
    nextSetButton.hidden = true;
    questionContainer.replaceChildren();

    set.questions.forEach((question, index) => {
      const card = document.createElement("div");
      card.className = "question";
      const number = document.createElement("div");
      number.className = "qnum";
      number.textContent = String(index + 1);
      const content = document.createElement("div");
      const title = document.createElement("p");
      title.className = "qtitle";
      title.textContent = question.prompt;
      const row = document.createElement("div");
      row.className = "answer-row";
      const inputId = `questionAnswer${index + 1}`;
      const label = document.createElement("label");
      label.className = "sr-only";
      label.htmlFor = inputId;
      label.textContent = `Your answer to question ${index + 1}`;
      const input = document.createElement("input");
      input.className = "answer";
      input.id = inputId;
      input.type = "text";
      input.inputMode = typeof question.answer === "number" ? "decimal" : "text";
      input.autocomplete = "off";
      input.spellcheck = false;
      input.placeholder = typeof question.answer === "number" ? "Type a number" : "Type the text";
      const checkButton = document.createElement("button");
      checkButton.className = "check";
      checkButton.type = "button";
      checkButton.textContent = "Check";
      const hintButton = document.createElement("button");
      hintButton.className = "hint-button";
      hintButton.type = "button";
      hintButton.textContent = "Hint";
      hintButton.setAttribute("aria-label", `Get an unlimited hint for question ${index + 1}`);
      const feedback = document.createElement("p");
      feedback.className = "feedback";
      feedback.setAttribute("aria-live", "polite");
      const hintFeedback = document.createElement("p");
      hintFeedback.className = "hint-feedback";
      hintFeedback.setAttribute("aria-live", "polite");
      let hintIndex = 0;
      hintButton.addEventListener("click", () => {
        const hints = getHintSequence(currentSet.id, question.prompt);
        hintFeedback.textContent = hints[hintIndex];
        hintIndex = (hintIndex + 1) % hints.length;
      });

      const checkAnswer = () => {
        if (!input.value.trim()) {
          feedback.textContent = "Type your prediction first.";
          feedback.className = "feedback retry";
          input.focus();
          return;
        }
        if (answerIsCorrect(input.value, question.answer)) {
          feedback.textContent = "That’s right — nice work!";
          feedback.className = "feedback good";
          card.classList.add("solved");
          input.disabled = true;
          checkButton.disabled = true;
          checkButton.textContent = "Correct";
          solvedCount += 1;
          setProgress.textContent = `${solvedCount} of ${set.questions.length} correct`;
          if (solvedCount === set.questions.length) {
            setProgress.textContent = `All ${set.questions.length} correct — a different set is ready!`;
            nextSetButton.hidden = false;
          }
        } else {
          feedback.textContent = "Not quite yet. Trace the code and try again.";
          feedback.className = "feedback retry";
          input.select();
        }
      };

      checkButton.addEventListener("click", checkAnswer);
      input.addEventListener("keydown", (event) => { if (event.key === "Enter") checkAnswer(); });
      row.append(label, input, checkButton, hintButton);
      content.append(title, row, feedback, hintFeedback);
      card.append(number, content);
      questionContainer.append(card);
    });
  }

  nextSetButton.addEventListener("click", () => renderQuestions(generateQuestionSet()));
  renderQuestions(generateQuestionSet());

  document.getElementById("fullscreenBtn").addEventListener("click", async () => {
    const board = document.querySelector(".board");
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await board.requestFullscreen();
    } catch (error) {
      document.getElementById("fullscreenBtn").textContent = "Full screen unavailable";
    }
  });
})();
