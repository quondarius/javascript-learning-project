(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const level = document.body.dataset.level;
  const challenges = window.SPACE_LAB_CHALLENGES || [];
  const editor = $("codeEditor");
  const output = $("outputBody");
  const status = $("runStatus");
  const runner = $("runner");
  const answerInput = $("answerInput");
  const checkButton = $("checkAnswerBtn");
  const nextButton = $("nextStepBtn");
  const hintButton = $("hintBtn");
  const stateKey = `spaceLab.learn.${level}.v1`;
  let runId = 0;

  function readState() {
    try {
      const saved = JSON.parse(localStorage.getItem(stateKey) || "null");
      if (saved && typeof saved === "object") return {
        challengeIndex: Number.isInteger(saved.challengeIndex) ? saved.challengeIndex : 0,
        questionIndex: Number.isInteger(saved.questionIndex) ? saved.questionIndex : 0,
        completed: Array.isArray(saved.completed) ? saved.completed : [],
        drafts: saved.drafts && typeof saved.drafts === "object" ? saved.drafts : {},
        answers: saved.answers && typeof saved.answers === "object" ? saved.answers : {},
        hints: saved.hints && typeof saved.hints === "object" ? saved.hints : {},
      };
    } catch (_) { /* local storage may be unavailable */ }
    return { challengeIndex: 0, questionIndex: 0, completed: [], drafts: {}, answers: {}, hints: {} };
  }

  const state = readState();
  state.challengeIndex = Math.max(0, Math.min(state.challengeIndex, challenges.length - 1));
  state.questionIndex = Math.max(0, Math.min(state.questionIndex, challenges[state.challengeIndex].questions.length - 1));

  const challengeNow = () => challenges[state.challengeIndex];
  const questionNow = () => challengeNow().questions[state.questionIndex];
  const questionKey = () => `${challengeNow().id}:${state.questionIndex}`;
  const isComplete = () => state.completed.includes(questionKey());

  function saveState() {
    try { localStorage.setItem(stateKey, JSON.stringify(state)); } catch (_) { /* keep practicing if storage is full */ }
  }

  function setFeedback(message, kind = "") {
    const node = $("answerFeedback");
    node.textContent = message;
    node.className = `feedback${kind ? ` ${kind}` : ""}`;
  }

  function showAnswer() {
    const question = questionNow();
    const reveal = $("answerReveal");
    reveal.textContent = `Answer: ${String(question.answer)}. ${question.explain}`;
    reveal.classList.toggle("visible", isComplete());
  }

  function render() {
    const challenge = challengeNow();
    const question = questionNow();
    const key = questionKey();
    const complete = isComplete();
    const total = challenges.length;

    $("missionNumber").textContent = `Mission ${state.challengeIndex + 1} of ${total}`;
    $("starCount").textContent = `✦ ${state.completed.length} star${state.completed.length === 1 ? "" : "s"}`;
    $("gameTag").textContent = `${challenge.gameEmoji} ${challenge.game}`;
    $("missionTitle").textContent = challenge.title;
    $("missionExplain").textContent = challenge.lesson;
    $("questionStep").textContent = `Tiny step ${state.questionIndex + 1} of ${challenge.questions.length}`;
    $("questionPrompt").textContent = question.prompt;
    $("referenceTitle").textContent = challenge.referenceTitle;
    $("referenceCopy").textContent = challenge.referenceCopy;
    $("referenceCode").textContent = challenge.referenceCode;
    $("referenceTip").textContent = challenge.referenceTip;
    $("editorLabel").textContent = `${level}.js · ${challenge.topic}`;
    $("progressSummary").textContent = `${state.completed.length} small wins saved on this device`;

    if (editor.dataset.challengeId !== challenge.id) {
      editor.value = Object.prototype.hasOwnProperty.call(state.drafts, challenge.id) ? state.drafts[challenge.id] : challenge.code;
      editor.dataset.challengeId = challenge.id;
      output.innerHTML = '<span class="output-placeholder">Run the code to watch it think.</span>';
      status.textContent = "Ready";
    }
    answerInput.value = state.answers[key] || "";
    answerInput.disabled = complete;
    checkButton.disabled = complete;
    nextButton.disabled = !complete;
    nextButton.textContent = state.questionIndex < challenge.questions.length - 1
      ? "Next tiny step →"
      : state.challengeIndex < total - 1 ? "Next mini-game 🚀" : "Replay the first mission ↺";

    if (complete) setFeedback("Signal found! You tried first—now the answer and a tiny explanation are yours.", "good");
    else setFeedback("Try your best guess first. A wrong try never shows the answer.");
    showAnswer();
    const hintIndex = state.hints[key] || 0;
    $("hintText").textContent = hintIndex ? `Hint ${hintIndex}: ${question.hints[(hintIndex - 1) % question.hints.length]}` : "Need a nudge? Ask as often as you like—no score loss, ever.";
    saveState();
  }

  function equivalentAnswer(raw, expected) {
    const value = raw.trim();
    if (!value) return false;
    if (typeof expected === "number") return Number.isFinite(Number(value)) && Number(value) === expected;
    if (typeof expected === "boolean") return value.toLowerCase() === String(expected);
    const unquoted = ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) ? value.slice(1, -1) : value;
    return unquoted === String(expected);
  }

  function checkAnswer() {
    if (isComplete()) return;
    const question = questionNow();
    const key = questionKey();
    state.answers[key] = answerInput.value;
    if (equivalentAnswer(answerInput.value, question.answer)) {
      state.completed.push(key);
      saveState();
      setFeedback("Lovely! One signal caught ✨ You can move on whenever you’re ready.", "good");
      answerInput.disabled = true;
      checkButton.disabled = true;
      nextButton.disabled = false;
      $("nextStepBtn").focus();
      showAnswer();
      $("starCount").textContent = `✦ ${state.completed.length} star${state.completed.length === 1 ? "" : "s"}`;
      $("progressSummary").textContent = `${state.completed.length} small wins saved on this device`;
      return;
    }
    saveState();
    setFeedback("Not quite—and no worries. Follow just one line, then try again. The answer stays tucked away.", "bad");
    answerInput.focus();
    answerInput.select();
  }

  function nextStep() {
    if (!isComplete()) return;
    if (state.questionIndex < challengeNow().questions.length - 1) state.questionIndex += 1;
    else {
      state.challengeIndex = (state.challengeIndex + 1) % challenges.length;
      state.questionIndex = 0;
      editor.dataset.challengeId = "";
    }
    render();
    answerInput.focus();
  }

  function giveHint() {
    const key = questionKey();
    const question = questionNow();
    const nextHint = (state.hints[key] || 0) + 1;
    state.hints[key] = nextHint;
    $("hintText").textContent = `Hint ${nextHint} (free, always): ${question.hints[(nextHint - 1) % question.hints.length]}`;
    saveState();
  }

  function resetExample() {
    editor.value = challengeNow().code;
    state.drafts[challengeNow().id] = editor.value;
    output.innerHTML = '<span class="output-placeholder">Example restored. Run it when you’re ready.</span>';
    output.classList.remove("error");
    status.textContent = "Ready";
    saveState();
    editor.focus();
  }

  runner.srcdoc = `<!doctype html><meta charset="utf-8"><script>
    addEventListener("message", async (event) => {
      if (event.source !== parent || !event.data || event.data.type !== "space-lab-run") return;
      const { id, code } = event.data;
      const lines = [];
      const format = (value) => {
        if (typeof value === "string") return value;
        try { const json = JSON.stringify(value); return json === undefined ? String(value) : json; }
        catch (_) { return String(value); }
      };
      const captured = { log: (...values) => lines.push(values.map(format).join(" ")), error: (...values) => lines.push(values.map(format).join(" ")) };
      const safeTimeout = (callback, delay = 0) => setTimeout(callback, Math.min(Math.max(Number(delay) || 0, 0), 1500));
      try {
        const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
        await new AsyncFunction("console", "setTimeout", "clearTimeout", String(code))(captured, safeTimeout, clearTimeout);
        parent.postMessage({ type: "space-lab-result", id, lines }, "*");
      } catch (error) {
        parent.postMessage({ type: "space-lab-error", id, message: error && error.message ? error.message : String(error) }, "*");
      }
    });
  <\/script>`;

  $("runBtn").addEventListener("click", () => {
    const id = ++runId;
    status.textContent = "Running…";
    output.textContent = "";
    output.classList.remove("error");
    runner.contentWindow.postMessage({ type: "space-lab-run", id, code: editor.value }, "*");
  });

  window.addEventListener("message", (event) => {
    if (event.source !== runner.contentWindow || !event.data || event.data.id !== runId) return;
    if (event.data.type === "space-lab-error") {
      status.textContent = "Needs a fix";
      output.textContent = `Error: ${event.data.message}`;
      output.classList.add("error");
      return;
    }
    status.textContent = "Finished";
    output.textContent = event.data.lines.length ? event.data.lines.join("\n") : "(No console output)";
  });

  function indentEditor(event) {
    if (event.key !== "Tab") return;
    event.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const lineBreak = "\n";
    if (start === end && !event.shiftKey) {
      editor.setRangeText("  ", start, end, "end");
      editor.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
    const firstLine = text.lastIndexOf(lineBreak, start - 1) + 1;
    let lastLine = text.indexOf(lineBreak, end);
    if (lastLine < 0) lastLine = text.length;
    const selected = text.slice(firstLine, lastLine);
    const rows = selected.split(lineBreak);
    const changed = event.shiftKey ? rows.map((row) => row.replace(/^ {1,2}/, "")) : rows.map((row) => `  ${row}`);
    const replacement = changed.join(lineBreak);
    editor.setRangeText(replacement, firstLine, lastLine, "select");
    editor.setSelectionRange(firstLine, firstLine + replacement.length);
    editor.dispatchEvent(new Event("input", { bubbles: true }));
  }

  editor.addEventListener("input", () => {
    state.drafts[challengeNow().id] = editor.value;
    saveState();
  });
  editor.addEventListener("keydown", indentEditor);
  answerInput.addEventListener("input", () => { state.answers[questionKey()] = answerInput.value; saveState(); });
  answerInput.addEventListener("keydown", (event) => { if (event.key === "Enter") checkAnswer(); });
  checkButton.addEventListener("click", checkAnswer);
  nextButton.addEventListener("click", nextStep);
  hintButton.addEventListener("click", giveHint);
  $("resetBtn").addEventListener("click", resetExample);
  $("fullscreenBtn").addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) { /* fullscreen may be unavailable in a preview */ }
  });

  render();
})();
