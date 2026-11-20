(() => {
  "use strict";

  const LAST_SET_KEY = "spaceLab.hard.lastQuestionSet.v1";
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

  function makeSet(id, topic, explanation, code, questions) {
    const randomizedQuestions = shuffle(questions);
    return {
      id,
      topic,
      explanation,
      code,
      questions: randomizedQuestions,
      signature: JSON.stringify([id, code, randomizedQuestions.map((question) => question.prompt)])
    };
  }

  const setBuilders = [
    {
      id: "closure-pipeline",
      build() {
        const records = [
          { name: "Luna", score: randomInt(11, 17) },
          { name: "Niko", score: randomInt(20, 26) },
          { name: "Vega", score: randomInt(31, 37) }
        ];
        const minimum = randomInt(18, 28);
        const bonus = randomInt(2, 7);
        const selected = records
          .filter(makeSelector(minimum))
          .map(({ name, score }) => ({ name, adjusted: score + bonus }));
        const total = selected.reduce((sum, member) => sum + member.adjusted, 0);
        const code = `function makeSelector(minimum) {\n  return member => member.score >= minimum;\n}\nconst records = ${JSON.stringify(records, null, 2)};\nconst selected = records\n  .filter(makeSelector(${minimum}))\n  .map(({ name, score }) => ({ name, adjusted: score + ${bonus} }));\nconst total = selected.reduce((sum, member) => sum + member.adjusted, 0);\nconsole.log(selected);\nconsole.log(total);`;
        return makeSet("closure-pipeline", "Closure + object pipeline", "makeSelector closes over minimum. filter uses that remembered rule; map builds new objects; reduce adds their adjusted scores.", code, [
          { prompt: "How many records remain in selected?", answer: selected.length },
          { prompt: "Which name is first in selected?", answer: selected[0].name },
          { prompt: "What total do the adjusted scores add up to?", answer: total }
        ]);
      }
    },
    {
      id: "async-order",
      build() {
        const code = `const events = [];\nsetTimeout(() => events.push("timer"), 0);\nconst promiseWork = Promise.resolve("promise").then(label => events.push(label));\nevents.push("sync");\nawait promiseWork;\nawait new Promise(resolve => setTimeout(resolve, 0));\nconsole.log(events.join(" -> "));\nconsole.log(events[0]);\nconsole.log(events[1]);\nconsole.log(events[2]);`;
        return makeSet("async-order", "Asynchronous execution order", "Normal synchronous statements run first. Promise callbacks run as microtasks before timer callbacks; await both queued jobs before reading the final order.", code, [
          { prompt: "Which label is first in events?", answer: "sync" },
          { prompt: "Which label is second, after the Promise callback?", answer: "promise" },
          { prompt: "Which label is last, after the timer callback?", answer: "timer" }
        ]);
      }
    },
    {
      id: "promise-all-map",
      build() {
        const scans = [
          { name: "Aster", raw: randomInt(10, 15) },
          { name: "Boreal", raw: randomInt(20, 26) },
          { name: "Cinder", raw: randomInt(28, 34) }
        ];
        const offset = randomInt(3, 8);
        const corrected = scans.map((scan) => ({ name: scan.name, corrected: scan.raw + offset }));
        const total = corrected.reduce((sum, scan) => sum + scan.corrected, 0);
        const code = `const scans = ${JSON.stringify(scans, null, 2)};\nconst offset = ${offset};\nasync function calibrate({ name, raw }) {\n  const reading = await Promise.resolve(raw);\n  return { name, corrected: reading + offset };\n}\nconst calibrated = await Promise.all(scans.map(scan => calibrate(scan)));\nconst total = calibrated.reduce((sum, scan) => sum + scan.corrected, 0);\nconsole.log(calibrated.map(scan => scan.corrected));\nconsole.log(total);`;
        return makeSet("promise-all-map", "Promise.all + object map/reduce", "map starts one async calibration per record. Promise.all waits for them and keeps input order; reduce then combines the corrected values.", code, [
          { prompt: "What value is stored in calibrated[1].corrected?", answer: corrected[1].corrected },
          { prompt: "How many calibrated records are returned?", answer: corrected.length },
          { prompt: "What total do all corrected readings add up to?", answer: total }
        ]);
      }
    },
    {
      id: "promise-catch",
      build() {
        const fallback = randomInt(30, 80);
        const code = `async function loadShield() {\n  try {\n    const livePower = await Promise.reject(new Error("uplink lost"));\n    return { power: livePower, source: "live" };\n  } catch (error) {\n    return { power: ${fallback}, source: "backup" };\n  }\n}\nconst shield = await loadShield();\nconsole.log(shield.power);\nconsole.log(shield.source);\nconsole.log(shield.source === "backup");`;
        return makeSet("promise-catch", "Rejected Promise + recovery", "awaiting a rejected Promise throws inside try. catch runs instead and returns a backup object, so later code can still use the result.", code, [
          { prompt: "What power value is used after recovery?", answer: fallback },
          { prompt: "What source label is stored in shield?", answer: "backup" },
          { prompt: "Does shield.source equal backup? Type true or false.", answer: true }
        ]);
      }
    },
    {
      id: "closure-quota",
      build() {
        const limit = randomInt(2, 3);
        const records = [{ id: "A" }, { id: "B" }, { id: "C" }, { id: "D" }];
        const processed = records.map((record, index) => ({ ...record, accepted: index < limit }));
        const accepted = processed.filter((record) => record.accepted);
        const code = `function makeGate(limit) {\n  let used = 0;\n  return record => {\n    used += 1;\n    return { ...record, accepted: used <= limit };\n  };\n}\nconst records = ${JSON.stringify(records)};\nconst passGate = makeGate(${limit});\nconst processed = records.map(passGate);\nconst accepted = processed.filter(({ accepted }) => accepted);\nconsole.log(accepted.map(({ id }) => id));\nconsole.log(processed[2].accepted);\nconsole.log(accepted.length);`;
        return makeSet("closure-quota", "Closure state + object filter", "passGate remembers how many records it has seen. map calls it in order; filter keeps the returned objects whose accepted property is true.", code, [
          { prompt: "How many records are in accepted?", answer: accepted.length },
          { prompt: "Is processed[2].accepted true or false?", answer: processed[2].accepted },
          { prompt: "What is the id of the last accepted record?", answer: accepted[accepted.length - 1].id }
        ]);
      }
    },
    {
      id: "async-recovery-pipeline",
      build() {
        const readings = [randomInt(8, 12), randomInt(17, 21), randomInt(30, 36)];
        const fallback = randomInt(4, 8);
        const minimum = randomInt(18, 25);
        const recovered = [readings[0], fallback, readings[2]];
        const filtered = recovered.filter((value) => value >= minimum);
        const total = filtered.reduce((sum, value) => sum + value, 0);
        const code = `async function readValue(value, shouldFail) {\n  try {\n    if (shouldFail) throw new Error("sensor offline");\n    return { value: await Promise.resolve(value), source: "live" };\n  } catch (error) {\n    return { value: ${fallback}, source: "backup" };\n  }\n}\nconst raw = [\n  { value: ${readings[0]}, fail: false },\n  { value: ${readings[1]}, fail: true },\n  { value: ${readings[2]}, fail: false }\n];\nconst reports = await Promise.all(raw.map(({ value, fail }) => readValue(value, fail)));\nconst aboveLimit = reports.filter(({ value }) => value >= ${minimum});\nconst total = aboveLimit.reduce((sum, { value }) => sum + value, 0);\nconsole.log(aboveLimit.length);\nconsole.log(total);\nconsole.log(reports[1].source);`;
        return makeSet("async-recovery-pipeline", "Promise recovery + filter/reduce", "Promise.all preserves the three report positions. The failed middle read becomes a backup value in catch; filter applies the limit and reduce totals the survivors.", code, [
          { prompt: "How many reports remain in aboveLimit?", answer: filtered.length },
          { prompt: "What total is stored in total?", answer: total },
          { prompt: "What source is used for reports[1]?", answer: "backup" }
        ]);
      }
    },
    {
      id: "closure-async-tag",
      build() {
        const prefix = pick(["NAV-", "CREW-", "ORBIT-"]);
        const crew = [
          { callsign: "Nova", status: "ready" },
          { callsign: "Echo", status: "hold" },
          { callsign: "Sol", status: "ready" }
        ];
        const ready = crew.filter((member) => member.status === "ready");
        const code = `function makeTagger(prefix) {\n  return async ({ callsign, status }) => {\n    const name = await Promise.resolve(callsign);\n    return { tag: prefix + name, ready: status === "ready" };\n  };\n}\nconst crew = ${JSON.stringify(crew, null, 2)};\nconst tagCrew = makeTagger(${JSON.stringify(prefix)});\nconst tagged = await Promise.all(crew.map(tagCrew));\nconst ready = tagged.filter(({ ready }) => ready);\nconsole.log(ready.map(({ tag }) => tag));\nconsole.log(ready.length);\nconsole.log(tagged.length);`;
        return makeSet("closure-async-tag", "Closure + async object pipeline", "makeTagger remembers prefix. map runs the async callback for each destructured crew object, Promise.all collects the tags, and filter keeps ready crew.", code, [
          { prompt: "What tag belongs to the first ready crew member?", answer: `${prefix}${ready[0].callsign}` },
          { prompt: "How many crew members are ready?", answer: ready.length },
          { prompt: "How many tags are in tagged before filtering?", answer: crew.length }
        ]);
      }
    },
    {
      id: "error-object-pipeline",
      build() {
        const records = [
          { name: "Mica", score: randomInt(5, 11) },
          { name: "Tarin", score: randomInt(15, 21) },
          { name: "Vela", score: randomInt(25, 32) }
        ];
        const bonus = randomInt(2, 5);
        const minimum = randomInt(20, 26);
        const results = records.map(({ name, score }) => {
          try {
            const adjusted = score + bonus;
            if (adjusted < minimum) throw new Error("below launch threshold");
            return { name, adjusted, active: true };
          } catch (error) {
            return { name, adjusted: 0, active: false };
          }
        });
        const active = results.filter(({ active: isActive }) => isActive);
        const total = active.reduce((sum, { adjusted }) => sum + adjusted, 0);
        const code = `const records = ${JSON.stringify(records, null, 2)};\nconst bonus = ${bonus};\nconst minimum = ${minimum};\nconst results = records.map(({ name, score }) => {\n  try {\n    const adjusted = score + bonus;\n    if (adjusted < minimum) throw new Error("below launch threshold");\n    return { name, adjusted, active: true };\n  } catch (error) {\n    return { name, adjusted: 0, active: false };\n  }\n});\nconst active = results.filter(({ active }) => active);\nconst total = active.reduce((sum, { adjusted }) => sum + adjusted, 0);\nconsole.log(results.map(({ active }) => active));\nconsole.log(total);`;
        return makeSet("error-object-pipeline", "try/catch + object pipeline", "map handles each record on its own. A thrown error goes to catch and becomes an inactive fallback object; filter and reduce then use only active results.", code, [
          { prompt: "Is results[0].active true or false?", answer: results[0].active },
          { prompt: "How many records remain in active?", answer: active.length },
          { prompt: "What total is stored in total?", answer: total }
        ]);
      }
    }
  ];

  function previousSignature() {
    try { return window.localStorage.getItem(LAST_SET_KEY) || ""; }
    catch (error) { return ""; }
  }

  function generateSet() {
    const previous = previousSignature();
    let set;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      set = pick(setBuilders).build();
      if (set.signature !== previous) break;
    }
    if (set.signature === previous) {
      let previousId = "";
      try { previousId = JSON.parse(previous)[0]; } catch (error) { /* No stored set yet. */ }
      const alternatives = setBuilders.filter((builder) => builder.id !== previousId);
      set = pick(alternatives).build();
    }
    try { window.localStorage.setItem(LAST_SET_KEY, set.signature); }
    catch (error) { /* Random practice still works if storage is unavailable. */ }
    return set;
  }

  function setOutput(text, isError = false) {
    output.textContent = text;
    output.classList.toggle("output-error", isError);
  }

  function resetConsole() {
    status.textContent = "Ready";
    output.classList.remove("output-error");
    output.innerHTML = '<span class="output-placeholder">Run the example to inspect its output.</span>';
  }

  function hintSequence(id, prompt) {
    const q = prompt.toLowerCase();
    if (id === "closure-pipeline") {
      if (q.includes("how many")) return ["The selector is a closure: it remembers the minimum passed to makeSelector.", "filter keeps each record whose score passes that remembered test.", "Check the score of every record against the threshold, then count the survivors."];
      if (q.includes("which name")) return ["filter keeps the original order of records.", "After filtering, map makes a new object but keeps each name.", "Find the first source record that passes the selector, then read its name."];
      return ["map adds the same bonus to each selected score.", "reduce visits each mapped object and carries a running sum.", "Add the adjusted scores of the records that passed the filter."];
    }
    if (id === "async-order") {
      if (q.includes("first")) return ["Separate normal statements from callbacks that are queued for later.", "The current script continues before the queued Promise or timer callback runs.", "Trace the event list at the exact moment the first push happens."];
      if (q.includes("second")) return ["A Promise .then callback is queued as a microtask.", "Microtasks run after the current synchronous code and before timer tasks.", "Compare the Promise callback with the timer callback in the queue."];
      return ["The timer callback is a task scheduled for later.", "The code awaits both the Promise callback and a timer turn before reading the array.", "Track which queued callback runs after the Promise reaction."];
    }
    if (id === "promise-all-map") {
      if (q.includes("[1]")) return ["Promise.all returns results in the same order as the input list.", "Index 1 points to the second scan; calibrate destructures its raw value.", "Use the second raw reading and apply the shared offset."];
      if (q.includes("how many")) return ["map creates one calibration Promise per scan.", "Promise.all gathers all of those results.", "Count the scan records given at the start."];
      return ["Each calibrated record has a corrected value.", "reduce starts at 0 and adds each corrected reading.", "Sum the three raw readings after applying the offset to each."];
    }
    if (id === "promise-catch") {
      if (q.includes("power")) return ["The Promise rejects, so execution leaves the rest of the try block.", "catch returns a new object with a fallback power value.", "Find the value supplied in the catch object's power property."];
      if (q.includes("source")) return ["The rejected await transfers control to catch.", "The object returned by catch has its own source property.", "Read that property from the recovery object."];
      return ["The comparison checks the source property against a string.", "Trace which object was returned after the rejected Promise.", "Use the comparison's true/false result, not the text of the label."];
    }
    if (id === "closure-quota") {
      if (q.includes("how many")) return ["map calls passGate once for each record, in order.", "The closure increments used on every call and compares it with limit.", "Count the records whose returned accepted flag is true."];
      if (q.includes("processed[2]")) return ["Array index 2 is the third record.", "By then, the gate has been called three times.", "Compare the used count on that call with the remembered limit."];
      return ["filter preserves the order of accepted records.", "The gate permits only the first limit records.", "Find the last id among the records that passed."];
    }
    if (id === "async-recovery-pipeline") {
      if (q.includes("how many")) return ["Promise.all preserves the three input positions.", "The middle call fails and catch substitutes a backup reading.", "Apply the >= limit test to each recovered value, then count matches."];
      if (q.includes("total")) return ["First work out which recovered readings pass the threshold.", "reduce starts from 0 and adds only the values that passed filter.", "The failed reading contributes its fallback value, not its rejected live value."];
      return ["Promise.all keeps reports in input order.", "The middle raw record is passed with fail set to true.", "A failing read returns the fallback object's source label from catch."];
    }
    if (id === "closure-async-tag") {
      if (q.includes("first ready")) return ["makeTagger closes over the prefix string.", "Promise.all keeps the crew order after the async mapping finishes.", "Find the first member whose ready flag is true, then combine prefix and callsign."];
      if (q.includes("how many")) return ["filter checks the ready property on each tagged object.", "The async callback copies each member's status into that property.", "Count only the members marked ready."];
      return ["Promise.all returns one completed tag object per crew member.", "The later filter makes a shorter ready list.", "This asks for tagged before that filter, so count the original crew."];
    }
    if (id === "error-object-pipeline") {
      if (q.includes("results[0]")) return ["map handles the first record inside a try block.", "The adjusted score is compared with minimum.", "If it is below the threshold, throw jumps straight to catch."];
      if (q.includes("how many")) return ["catch turns a failing record into an object with active set false.", "filter keeps only objects whose active flag is true.", "Count the records that did not fall back to the inactive object."];
      return ["First identify records whose adjusted score meets the minimum.", "Only those records remain in active; caught errors contribute no score.", "reduce adds the adjusted values from active objects only."];
    }
    return ["Trace each value from its starting point through the code.", "Check which callback, Promise, or catch branch changes the value.", "Follow one operation at a time and then check the variable the question names."];
  }

  // User code runs only in a script-sandboxed iframe.
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
    if (event.data.type === "error") {
      status.textContent = "Needs a fix";
      setOutput(`Error: ${event.data.message}`, true);
      return;
    }
    status.textContent = "Finished";
    setOutput(event.data.lines.length ? event.data.lines.join("\n") : "(No console output)");
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

  function renderSet(set) {
    currentSet = set;
    solvedCount = 0;
    editor.value = set.code;
    resetConsole();
    exerciseTopic.textContent = set.topic;
    conceptTitle.textContent = set.topic;
    conceptText.textContent = set.explanation;
    setProgress.textContent = `0 of ${set.questions.length} correct — answer all questions to unlock another challenge.`;
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
        const hints = hintSequence(set.id, question.prompt);
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
          feedback.textContent = "Correct — well traced!";
          feedback.className = "feedback good";
          card.classList.add("solved");
          input.disabled = true;
          checkButton.disabled = true;
          checkButton.textContent = "Correct";
          solvedCount += 1;
          setProgress.textContent = `${solvedCount} of ${set.questions.length} correct`;
          if (solvedCount === set.questions.length) {
            setProgress.textContent = `All ${set.questions.length} correct — a new randomized challenge is ready!`;
            nextSetButton.hidden = false;
          }
        } else {
          feedback.textContent = "Not yet. Trace the order and try again — no penalty.";
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

  nextSetButton.addEventListener("click", () => renderSet(generateSet()));
  renderSet(generateSet());

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
