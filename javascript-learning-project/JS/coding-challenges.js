(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const difficultySelect = $("difficultySelect");
  const topicNode = $("challengeTopic");
  const titleNode = $("challengeTitle");
  const summaryNode = $("challengeSummary");
  const requirementsNode = $("requirementsList");
  const exampleInputNode = $("exampleInput");
  const exampleOutputNode = $("exampleOutput");
  const editor = $("solutionEditor");
  const runOutput = $("runOutput");
  const runStatus = $("runStatus");
  const feedback = $("feedback");
  const hintCard = $("hintCard");
  const hintHeading = $("hintHeading");
  const hintText = $("hintText");
  const nextButton = $("nextChallengeBtn");
  const runButton = $("runBtn");
  const checkButton = $("checkBtn");
  const resetButton = $("resetBtn");
  const hintButton = $("hintBtn");
  const difficultyDescription = $("difficultyDescription");
  const difficultyCount = $("difficultyCount");
  const runner = $("runner");
  const challengeLayout = document.querySelector(".challenge-layout");
  const referencePanel = $("referencePanel");

  const difficultyCopy = {
    beginner: "Build confidence with strings, numbers, and arrays.",
    intermediate: "Combine objects, grouping, and state kept by closures.",
    hard: "Join closures, data pipelines, asynchronous work, and recovery."
  };

  const starterFor = (asyncTask = false) => `${asyncTask ? "async " : ""}function solve(input) {\n  // Write your solution here.\n}\n`;
  const mission = (details) => ({ starter: starterFor(Boolean(details.async)), ...details });

  const challenges = {
    beginner: [
      mission({
        id: "sum-positive",
        topic: "Beginner · Arrays and numbers",
        title: "Add only the positive numbers",
        summary: "Write a function that receives an array of numbers and returns the sum of the values greater than zero.",
        requirements: ["Name the function solve(input).", "Ignore zero and negative values.", "Return the number 0 when there are no positive values.", "Do not change the original array."],
        exampleInput: "[4, -2, 0, 7, -1]",
        exampleOutput: "11",
        example: [4, -2, 0, 7, -1],
        tests: [
          { input: [4, -2, 0, 7, -1], expected: 11 },
          { input: [-5, -3, 0], expected: 0 },
          { input: [2, 3, 9], expected: 14 },
          { input: [], expected: 0 }
        ],
        hints: [
          "A useful array method here is filter: keep numbers that pass a condition.",
          "After filtering, you need one starting total and a way to add each remaining number.",
          "Think of a pipeline: first keep values greater than zero, then reduce them into one sum."
        ]
      }),
      mission({
        id: "count-vowels",
        topic: "Beginner · Strings",
        title: "Count the vowels",
        summary: "Return how many vowel letters appear in a string. Treat uppercase and lowercase vowels the same.",
        requirements: ["Count a, e, i, o, and u only.", "Ignore letter case.", "Return 0 for an empty string or a string with no vowels."],
        exampleInput: "\"Space Lab\"",
        exampleOutput: "4",
        example: "Space Lab",
        tests: [
          { input: "Space Lab", expected: 4 },
          { input: "JAVASCRIPT", expected: 3 },
          { input: "rhythm", expected: 0 },
          { input: "", expected: 0 }
        ],
        hints: [
          "You can inspect the string one character at a time.",
          "Convert each character to lowercase before checking it.",
          "A string like \"aeiou\" can help you test whether a character is a vowel. Count the matches."
        ]
      }),
      mission({
        id: "title-words",
        topic: "Beginner · String transformation",
        title: "Capitalize each word",
        summary: "Turn a phrase into title-style words: uppercase the first character of each word and leave the rest of that word unchanged.",
        requirements: ["Words are separated by one or more spaces.", "Preserve the remaining letters in each word.", "Return an empty string for empty or all-space input."],
        exampleInput: "\"hello, space lab\"",
        exampleOutput: "\"Hello, Space Lab\"",
        example: "hello, space lab",
        tests: [
          { input: "hello, space lab", expected: "Hello, Space Lab" },
          { input: "a  new   orbit", expected: "A New Orbit" },
          { input: "JavaScript", expected: "JavaScript" },
          { input: "   ", expected: "" }
        ],
        hints: [
          "First separate the phrase into words, ignoring extra spaces.",
          "For each word, combine its first character in uppercase with the rest of the word.",
          "Join the transformed words with a single space."
        ]
      })
    ],
    intermediate: [
      mission({
        id: "group-by-category",
        topic: "Intermediate · Objects and arrays",
        title: "Group names by category",
        summary: "Given an array of records, create an object whose keys are categories and whose values are arrays of matching names.",
        requirements: ["Input records have name and category properties.", "Keep names in their original order within each category.", "Return an empty object for an empty array."],
        exampleInput: "[{name:\"Mira\",category:\"star\"}, {name:\"Io\",category:\"moon\"}, {name:\"Sol\",category:\"star\"}]",
        exampleOutput: "{star:[\"Mira\",\"Sol\"], moon:[\"Io\"]}",
        example: [{ name: "Mira", category: "star" }, { name: "Io", category: "moon" }, { name: "Sol", category: "star" }],
        tests: [
          { input: [{ name: "Mira", category: "star" }, { name: "Io", category: "moon" }, { name: "Sol", category: "star" }], expected: { star: ["Mira", "Sol"], moon: ["Io"] } },
          { input: [{ name: "A", category: "x" }, { name: "B", category: "x" }, { name: "C", category: "y" }], expected: { x: ["A", "B"], y: ["C"] } },
          { input: [], expected: {} }
        ],
        hints: [
          "Start with an empty object that will become your groups.",
          "For each record, check whether its category key already has an array. Create one if it does not.",
          "Add that record's name to the category array."
        ]
      }),
      mission({
        id: "closure-counter",
        topic: "Intermediate · Closures",
        title: "Run a small counter",
        summary: "Use a closure to keep a counter value private while a sequence of actions updates it.",
        requirements: ["Input is {start, actions}; each action is \"up\" or \"down\".", "Begin at start, apply each action in order, and return the value after every action.", "Use an inner function that remembers the current value."],
        exampleInput: "{start: 5, actions:[\"up\",\"up\",\"down\"]}",
        exampleOutput: "[6, 7, 6]",
        example: { start: 5, actions: ["up", "up", "down"] },
        tests: [
          { input: { start: 5, actions: ["up", "up", "down"] }, expected: [6, 7, 6] },
          { input: { start: 0, actions: ["down", "down", "up"] }, expected: [-1, -2, -1] },
          { input: { start: 10, actions: [] }, expected: [] }
        ],
        hints: [
          "Create a local variable for the current count inside a helper function.",
          "Have the helper return another function. That inner function can update the saved count.",
          "Call the returned function once per action and collect each new count in an array."
        ]
      }),
      mission({
        id: "inventory-summary",
        topic: "Intermediate · Map and reduce",
        title: "Summarize the inventory",
        summary: "Turn a list of products into a compact summary of total stock value and low-stock product names.",
        requirements: ["Each product has name, price, and quantity.", "stockValue is the sum of price multiplied by quantity.", "lowStockNames includes names with quantity below 4, in input order.", "Return {stockValue, lowStockNames}; do not mutate the input."],
        exampleInput: "[{name:\"Map\",price:3,quantity:5}, {name:\"Comet\",price:8,quantity:2}]",
        exampleOutput: "{stockValue:31, lowStockNames:[\"Comet\"]}",
        example: [{ name: "Map", price: 3, quantity: 5 }, { name: "Comet", price: 8, quantity: 2 }],
        tests: [
          { input: [{ name: "Map", price: 3, quantity: 5 }, { name: "Comet", price: 8, quantity: 2 }], expected: { stockValue: 31, lowStockNames: ["Comet"] } },
          { input: [{ name: "A", price: 2, quantity: 3 }, { name: "B", price: 5, quantity: 4 }], expected: { stockValue: 26, lowStockNames: ["A"] } },
          { input: [], expected: { stockValue: 0, lowStockNames: [] } }
        ],
        hints: [
          "The answer has two parts, so calculate the stock value and low-stock names separately.",
          "Use reduce for the total value, and filter followed by map for the names.",
          "For each product's value, multiply its price by its quantity. Low stock means quantity is less than 4."
        ]
      })
    ],
    hard: [
      mission({
        id: "async-closure-pipeline",
        async: true,
        topic: "Hard · Async closure pipeline",
        title: "Filter a flight manifest",
        summary: "Enrich a manifest asynchronously, then use a closure to keep only active crew whose adjusted score meets a launch limit.",
        requirements: ["Input is {limit, bonus, records}; each record has id, score, and active.", "Use Promise.all with an async mapping step; each adjusted score is score + bonus.", "Use a closure-based predicate to keep active records with adjusted score at least limit.", "Return {ids, total}, preserving record order; total is the sum of kept adjusted scores."],
        exampleInput: "{limit:15, bonus:3, records:[{id:\"A\",score:9,active:true},{id:\"B\",score:14,active:true},{id:\"C\",score:30,active:false}]}",
        exampleOutput: "{ids:[\"B\"], total:17}",
        example: { limit: 15, bonus: 3, records: [{ id: "A", score: 9, active: true }, { id: "B", score: 14, active: true }, { id: "C", score: 30, active: false }] },
        tests: [
          { input: { limit: 15, bonus: 3, records: [{ id: "A", score: 9, active: true }, { id: "B", score: 14, active: true }, { id: "C", score: 30, active: false }] }, expected: { ids: ["B"], total: 17 } },
          { input: { limit: 10, bonus: 1, records: [{ id: "A", score: 12, active: true }, { id: "B", score: 3, active: true }, { id: "C", score: 15, active: true }] }, expected: { ids: ["A", "C"], total: 29 } },
          { input: { limit: 100, bonus: 5, records: [] }, expected: { ids: [], total: 0 } }
        ],
        hints: [
          "Separate the work into stages: asynchronously enrich every record, then filter, then summarize.",
          "A helper can close over limit and return a predicate that checks both active and adjusted score.",
          "Promise.all preserves the input order. Use map to collect ids and reduce to add the kept scores."
        ]
      }),
      mission({
        id: "promise-fallback-batches",
        async: true,
        topic: "Hard · Promises and error recovery",
        title: "Recover failed cargo scans",
        summary: "Process several cargo batches concurrently. If a batch fails, return its fallback total instead of letting the whole operation fail.",
        requirements: ["Input is an array of {id, values, fail, fallback}.", "Return an array in input order with {id, total, recovered} for each batch.", "Successful batches sum values and use recovered:false.", "When fail is true, handle a rejected Promise with try/catch; use fallback and recovered:true."],
        exampleInput: "[{id:\"A\",values:[2,3],fail:false,fallback:0},{id:\"B\",values:[8],fail:true,fallback:6}]",
        exampleOutput: "[{id:\"A\",total:5,recovered:false},{id:\"B\",total:6,recovered:true}]",
        example: [{ id: "A", values: [2, 3], fail: false, fallback: 0 }, { id: "B", values: [8], fail: true, fallback: 6 }],
        tests: [
          { input: [{ id: "A", values: [2, 3], fail: false, fallback: 0 }, { id: "B", values: [8], fail: true, fallback: 6 }], expected: [{ id: "A", total: 5, recovered: false }, { id: "B", total: 6, recovered: true }] },
          { input: [{ id: "X", values: [], fail: false, fallback: 9 }, { id: "Y", values: [4, 1], fail: false, fallback: 0 }], expected: [{ id: "X", total: 0, recovered: false }, { id: "Y", total: 5, recovered: false }] },
          { input: [{ id: "Z", values: [100], fail: true, fallback: 12 }], expected: [{ id: "Z", total: 12, recovered: true }] }
        ],
        hints: [
          "Use map to start processing each batch, and Promise.all to wait for all mapped Promises.",
          "Inside each async batch worker, put the operation that can reject inside try/catch.",
          "In catch, build the recovered result with that batch's id and fallback. Keep the same result shape as a successful batch."
        ]
      }),
      mission({
        id: "closure-quota",
        topic: "Hard · Closure and object transformation",
        title: "Enforce a launch quota",
        summary: "Walk a list of candidate objects and accept only the first few that are active and meet a score threshold. A closure keeps track of how many slots remain.",
        requirements: ["Input is {limit, quota, records}; records have id, score, and active.", "Create a closure-based gate that remembers how many qualifying records have been accepted.", "Return {accepted, rejected} arrays of ids, in input order.", "Inactive or below-threshold records are rejected and do not use a quota slot."],
        exampleInput: "{limit:10, quota:2, records:[{id:\"A\",score:12,active:true},{id:\"B\",score:5,active:true},{id:\"C\",score:13,active:true}]}",
        exampleOutput: "{accepted:[\"A\",\"C\"], rejected:[\"B\"]}",
        example: { limit: 10, quota: 2, records: [{ id: "A", score: 12, active: true }, { id: "B", score: 5, active: true }, { id: "C", score: 13, active: true }] },
        tests: [
          { input: { limit: 10, quota: 2, records: [{ id: "A", score: 12, active: true }, { id: "B", score: 5, active: true }, { id: "C", score: 13, active: true }] }, expected: { accepted: ["A", "C"], rejected: ["B"] } },
          { input: { limit: 7, quota: 1, records: [{ id: "N", score: 9, active: false }, { id: "P", score: 8, active: true }, { id: "Q", score: 11, active: true }] }, expected: { accepted: ["P"], rejected: ["N", "Q"] } },
          { input: { limit: 4, quota: 3, records: [] }, expected: { accepted: [], rejected: [] } }
        ],
        hints: [
          "A simple boolean condition is not enough; the gate needs remembered state across records.",
          "Make a helper that closes over a remaining-slots count and returns a function for one record.",
          "Check active and score first. Only when those pass should the closure spend a slot. Then collect ids by the gate's result."
        ]
      })
    ]
  };

  const frameSource = `<!doctype html><meta charset="utf-8"><script>
    function printable(value) {
      if (typeof value === "string") return value;
      if (value === undefined) return "undefined";
      try { return JSON.stringify(value, null, 2); } catch (_) { return String(value); }
    }
    function equal(a, b) {
      if (Object.is(a, b)) return true;
      if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") return false;
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      const aKeys = Object.keys(a).sort();
      const bKeys = Object.keys(b).sort();
      if (aKeys.length !== bKeys.length || aKeys.some((key, i) => key !== bKeys[i])) return false;
      return aKeys.every((key) => equal(a[key], b[key]));
    }
    window.addEventListener("message", async (event) => {
      const request = event.data;
      if (!request || request.channel !== "space-code-lab") return;
      const logs = [];
      const consoleProxy = { log: (...values) => logs.push(values.map(printable).join(" ")), warn: (...values) => logs.push(values.map(printable).join(" ")), error: (...values) => logs.push(values.map(printable).join(" ")) };
      try {
        const factory = new Function("console", "setTimeout", "clearTimeout", request.code + "\\n; return typeof solve === 'function' ? solve : null;");
        const solve = factory(consoleProxy, setTimeout, clearTimeout);
        if (typeof solve !== "function") throw new Error("Create a function named solve(input) before running the checks.");
        if (request.mode === "run") {
          const result = await solve(request.example);
          const lines = logs.slice();
          lines.push("Return value:\\n" + printable(result));
          parent.postMessage({ channel: "space-code-result", runId: request.runId, mode: request.mode, output: lines.join("\\n") }, "*");
          return;
        }
        let passed = 0;
        for (const test of request.tests) {
          const actual = await solve(test.input);
          if (equal(actual, test.expected)) passed += 1;
        }
        parent.postMessage({ channel: "space-code-result", runId: request.runId, mode: request.mode, passed, total: request.tests.length }, "*");
      } catch (error) {
        parent.postMessage({ channel: "space-code-result", runId: request.runId, mode: request.mode, error: (error && error.name ? error.name + ": " : "") + (error && error.message ? error.message : String(error)) }, "*");
      }
    });
  </script>`;

  let activeChallenge = null;
  let hintIndex = 0;
  let requestSequence = 0;
  let activeRequestId = null;
  let isSolved = false;

  function safeStorageGet(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }
  function safeStorageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (_) { /* Storage can be disabled; the page still works. */ }
  }
  function pretty(value) {
    return JSON.stringify(value, null, 2);
  }
  const SESSION_KEY = "spaceCodeLab.session.v1";
  function readSessionStore() {
    try {
      const saved = JSON.parse(safeStorageGet(SESSION_KEY) || "null");
      if (saved && saved.version === 1 && saved.sessions && typeof saved.sessions === "object") return saved;
    } catch (_) { /* Ignore an incomplete or older saved session. */ }
    return { version: 1, activeLevel: "", sessions: {} };
  }
  function validSavedSession(saved) {
    const challenge = saved && saved.challenge;
    return Boolean(challenge && typeof challenge.id === "string" && typeof challenge.title === "string" &&
      typeof challenge.starter === "string" && Array.isArray(challenge.requirements) &&
      Array.isArray(challenge.tests) && challenge.tests.length > 0 && Array.isArray(challenge.hints) &&
      Object.prototype.hasOwnProperty.call(challenge, "example"));
  }
  function persistSession(level = difficultySelect.value) {
    if (!activeChallenge || !challenges[level]) return;
    const saved = readSessionStore();
    saved.activeLevel = level;
    saved.sessions[level] = {
      challenge: activeChallenge,
      editorDraft: editor.value,
      hintIndex,
      hintRevealed: hintCard.classList.contains("revealed"),
      hintHeading: hintHeading.textContent,
      hintText: hintText.textContent,
      isSolved,
      runOutput: runOutput.textContent,
      runStatus: runStatus.textContent,
      feedbackText: feedback.textContent,
      feedbackClass: feedback.className
    };
    safeStorageSet(SESSION_KEY, JSON.stringify(saved));
    safeStorageSet(`spaceCodeLab.last.${level}`, activeChallenge.id);
  }
  function selectedLineStarts(text, start, end) {
    var lineBreak = String.fromCharCode(10);
    var first = text.lastIndexOf(lineBreak, start - 1) + 1;
    var last = first;
    if (end > start) {
      var effectiveEnd = end;
      if (text.charAt(end - 1) === lineBreak) effectiveEnd -= 1;
      last = text.lastIndexOf(lineBreak, effectiveEnd - 1) + 1;
      if (last < first) last = first;
    }
    var starts = [first];
    var current = first;
    while (current < last) {
      var newline = text.indexOf(lineBreak, current);
      if (newline < 0 || newline + 1 > last) break;
      current = newline + 1;
      starts.push(current);
    }
    return starts;
  }
  function handleEditorTab(event) {
    if (event.key !== "Tab" && event.keyCode !== 9) return;
    event.preventDefault();
    var indent = "  ";
    var lineBreak = String.fromCharCode(10);
    var tabCharacter = String.fromCharCode(9);
    var value = editor.value;
    var start = editor.selectionStart;
    var end = editor.selectionEnd;
    var direction = editor.selectionDirection || "none";
    var scrollTop = editor.scrollTop;
    var scrollLeft = editor.scrollLeft;

    if (!event.shiftKey && start === end) {
      editor.setRangeText(indent, start, end, "end");
      editor.scrollTop = scrollTop;
      editor.scrollLeft = scrollLeft;
      persistSession();
      return;
    }

    var starts = selectedLineStarts(value, start, end);
    var segmentStart = starts[0];
    var segmentEnd = value.indexOf(lineBreak, starts[starts.length - 1]);
    if (segmentEnd < 0) segmentEnd = value.length;
    var lines = value.slice(segmentStart, segmentEnd).split(lineBreak);
    var changedLines = [];
    var newStart = start;
    var newEnd = end;
    var index;

    if (!event.shiftKey) {
      for (index = 0; index < lines.length; index += 1) changedLines.push(indent + lines[index]);
      var mapIndent = function (position) {
        var shifts = 0;
        for (var point = 0; point < starts.length; point += 1) if (starts[point] <= position) shifts += 1;
        return position + shifts * indent.length;
      };
      newStart = mapIndent(start);
      newEnd = mapIndent(end);
    } else {
      var removed = [];
      for (index = 0; index < lines.length; index += 1) {
        var count = 0;
        if (lines[index].charAt(0) === tabCharacter) count = 1;
        else while (count < indent.length && lines[index].charAt(count) === " ") count += 1;
        for (var character = 0; character < count; character += 1) removed.push(starts[index] + character);
        changedLines.push(lines[index].slice(count));
      }
      if (!removed.length) return;
      var mapUnindent = function (position) {
        var shifts = 0;
        for (var item = 0; item < removed.length; item += 1) if (removed[item] < position) shifts += 1;
        return position - shifts;
      };
      newStart = mapUnindent(start);
      newEnd = mapUnindent(end);
    }

    editor.setRangeText(changedLines.join(lineBreak), segmentStart, segmentEnd, "preserve");
    editor.setSelectionRange(newStart, newEnd, direction);
    editor.scrollTop = scrollTop;
    editor.scrollLeft = scrollLeft;
    persistSession();
  }
  function setFeedback(message, kind = "") {
    feedback.textContent = message;
    feedback.className = `feedback${kind ? ` ${kind}` : ""}`;
  }
  function pickChallenge(level, excludeId = "") {
    const pool = challenges[level];
    const choices = pool.filter((item) => item.id !== excludeId);
    const source = choices.length ? choices : pool;
    return source[Math.floor(Math.random() * source.length)];
  }
  function clearResult() {
    runOutput.textContent = "Run your function to see its return value here.";
    runStatus.textContent = "Ready";
    setFeedback("Your solution is checked against hidden test cases. Expected answers stay hidden after incorrect attempts.");
  }
  function showChallenge(challenge, level, savedSession = null) {
    activeChallenge = JSON.parse(JSON.stringify(challenge));
    challenge = activeChallenge;
    const hasPositiveNumbersReference = challenge.id === "sum-positive";
    referencePanel.hidden = !hasPositiveNumbersReference;
    challengeLayout.classList.toggle("has-reference", hasPositiveNumbersReference);
    hintIndex = savedSession && Number.isInteger(savedSession.hintIndex) && savedSession.hintIndex >= 0 ? savedSession.hintIndex : 0;
    isSolved = Boolean(savedSession && savedSession.isSolved);
    topicNode.textContent = challenge.topic;
    titleNode.textContent = challenge.title;
    summaryNode.textContent = challenge.summary;
    requirementsNode.replaceChildren(...challenge.requirements.map((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      return li;
    }));
    exampleInputNode.textContent = pretty(challenge.example);
    exampleOutputNode.textContent = pretty(challenge.tests[0].expected);
    editor.value = savedSession && typeof savedSession.editorDraft === "string" ? savedSession.editorDraft : challenge.starter;
    $("editorLabel").textContent = challenge.async ? "async solve(input)" : "solve(input)";
    hintHeading.textContent = savedSession && typeof savedSession.hintHeading === "string" ? savedSession.hintHeading : "Need a nudge?";
    hintText.textContent = savedSession && typeof savedSession.hintText === "string" ? savedSession.hintText : "Ask for as many hints as you like. They guide your next step without giving away the full solution.";
    hintCard.classList.toggle("revealed", Boolean(savedSession && savedSession.hintRevealed));
    nextButton.hidden = !isSolved;
    runButton.disabled = false;
    checkButton.disabled = false;
    runButton.textContent = "▶ Run example";
    checkButton.textContent = isSolved ? "Passed" : "Check solution";
    difficultyCount.textContent = `${challenges[level].length} challenge types`;
    if (savedSession) {
      runOutput.textContent = typeof savedSession.runOutput === "string" ? savedSession.runOutput : "Run your function to see its return value here.";
      runStatus.textContent = typeof savedSession.runStatus === "string" ? savedSession.runStatus : "Ready";
      feedback.textContent = typeof savedSession.feedbackText === "string" ? savedSession.feedbackText : "Your solution is checked against hidden test cases. Expected answers stay hidden after incorrect attempts.";
      feedback.className = typeof savedSession.feedbackClass === "string" ? savedSession.feedbackClass : "feedback";
    } else {
      clearResult();
    }
    persistSession(level);
  }
  function loadChallenge(level = difficultySelect.value, forceNew = false) {
    const saved = readSessionStore();
    const savedSession = !forceNew ? saved.sessions[level] : null;
    if (validSavedSession(savedSession)) {
      showChallenge(savedSession.challenge, level, savedSession);
      return;
    }
    const legacyId = safeStorageGet(`spaceCodeLab.last.${level}`) || "";
    if (!forceNew) {
      const legacyChallenge = challenges[level].find((item) => item.id === legacyId);
      if (legacyChallenge) {
        showChallenge(legacyChallenge, level);
        return;
      }
    }
    const previousId = forceNew ? (activeChallenge && difficultySelect.value === level ? activeChallenge.id : legacyId) : "";
    showChallenge(pickChallenge(level, previousId), level);
  }
  function sendToRunner(mode) {
    if (!activeChallenge) return;
    if (mode === "check" && isSolved) return;
    const runId = ++requestSequence;
    activeRequestId = runId;
    runButton.disabled = true;
    checkButton.disabled = true;
    runStatus.textContent = mode === "run" ? "Running…" : "Checking…";
    if (mode === "check") setFeedback("Running your solution against hidden checks…");
    persistSession();
    runner.contentWindow.postMessage({
      channel: "space-code-lab",
      runId,
      mode,
      code: editor.value,
      example: activeChallenge.example,
      tests: activeChallenge.tests
    }, "*");
  }

  runner.addEventListener("load", () => {
    runButton.disabled = false;
    checkButton.disabled = false;
  });
  runner.srcdoc = frameSource;

  window.addEventListener("message", (event) => {
    if (event.source !== runner.contentWindow || !event.data || event.data.channel !== "space-code-result") return;
    const result = event.data;
    if (result.runId !== activeRequestId) return;
    activeRequestId = null;
    runButton.disabled = false;
    checkButton.disabled = false;
    if (result.error) {
      runStatus.textContent = "Needs a fix";
      runOutput.textContent = result.error;
      if (result.mode === "check") setFeedback("Your code hit an error before all hidden checks could finish. Fix the error and try again; no expected answers are shown.", "error");
      persistSession();
      return;
    }
    if (result.mode === "run") {
      runStatus.textContent = "Finished";
      runOutput.textContent = result.output || "(No output)";
      setFeedback("Example run complete. You can edit the code and run it again, or check it against the hidden tests.");
      persistSession();
      return;
    }
    runStatus.textContent = "Checks complete";
    if (result.passed === result.total) {
      isSolved = true;
      runOutput.textContent = `All hidden checks passed (${result.passed}/${result.total}).`;
      setFeedback("All hidden checks passed. Nice work—your next challenge is unlocked!", "success");
      nextButton.hidden = false;
      checkButton.textContent = "Passed ✓";
    } else {
      runOutput.textContent = `Hidden checks passed: ${result.passed} of ${result.total}.`;
      setFeedback("Not all hidden checks passed yet. Revisit the requirements, try another input, or ask for a hint. The expected answers stay hidden.", "error");
    }
    persistSession();
  });

  difficultySelect.addEventListener("change", () => {
    difficultyDescription.textContent = difficultyCopy[difficultySelect.value];
    loadChallenge(difficultySelect.value);
  });
  editor.addEventListener("keydown", handleEditorTab);
  editor.addEventListener("input", () => persistSession());
  window.addEventListener("beforeunload", () => persistSession());
  runButton.addEventListener("click", () => sendToRunner("run"));
  checkButton.addEventListener("click", () => sendToRunner("check"));
  resetButton.addEventListener("click", () => {
    if (!activeChallenge) return;
    editor.value = activeChallenge.starter;
    clearResult();
    persistSession();
    editor.focus();
  });
  hintButton.addEventListener("click", () => {
    if (!activeChallenge) return;
    const hint = activeChallenge.hints[hintIndex % activeChallenge.hints.length];
    hintIndex += 1;
    hintHeading.textContent = `Hint ${hintIndex} · unlimited`;
    hintText.textContent = hint;
    hintCard.classList.add("revealed");
    persistSession();
  });
  nextButton.addEventListener("click", () => {
    if (isSolved) loadChallenge(difficultySelect.value, true);
  });
  $("fullscreenBtn").addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) await document.querySelector(".board").requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) {
      setFeedback("Full-screen mode is unavailable in this browser window.", "error");
    }
  });

  const initialSession = readSessionStore();
  const levels = Object.keys(challenges);
  const initialLevel = levels.includes(initialSession.activeLevel) ? initialSession.activeLevel : difficultySelect.value;
  difficultySelect.value = initialLevel;
  difficultyDescription.textContent = difficultyCopy[initialLevel];
  loadChallenge(initialLevel);
})();
