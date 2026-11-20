(() => {
  const LAST_SET_KEY = "spaceLab.lastQuestionSet.v1";
  const editor = document.getElementById("codeEditor");
  const output = document.getElementById("outputBody");
  const status = document.getElementById("runStatus");
  const frame = document.getElementById("runner");
  const questionContainer = document.getElementById("questionsContainer");
  const exerciseTopic = document.getElementById("exerciseTopic");
  const setProgress = document.getElementById("setProgress");
  const nextSetButton = document.getElementById("nextSetBtn");
  let pendingRunId = 0;
  let currentSet = null;
  let solvedCount = 0;
  let lastGeneratedSignature = null;

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

  function makeSet(id, topic, code, questions) {
    const randomizedQuestions = shuffle(questions);
    const signature = JSON.stringify([id, code, randomizedQuestions.map((question) => question.prompt)]);
    return { id, topic, code, questions: randomizedQuestions, signature };
  }

  const setBuilders = [
    {
      id: "score-trail",
      build() {
        const start = randomInt(4, 16);
        const add = randomInt(2, 9);
        const multiplier = randomInt(2, 4);
        const subtract = randomInt(1, 8);
        const afterAdd = start + add;
        const finalScore = afterAdd * multiplier - subtract;
        const code = `let score = ${start};\nscore = score + ${add};\nconsole.log(score);\nscore = score * ${multiplier};\nscore = score - ${subtract};\nconsole.log(score);`;
        return makeSet("score-trail", "Score trail", code, [
          { prompt: "After the first line, what is score?", answer: start },
          { prompt: "What number does the first console.log(score) print?", answer: afterAdd },
          { prompt: "What is score after the multiply and subtract lines?", answer: finalScore },
        ]);
      },
    },
    {
      id: "lives-and-bonus",
      build() {
        const start = randomInt(12, 28);
        const lost = randomInt(2, 8);
        const bonus = randomInt(1, 7);
        const afterLoss = start - lost;
        const finalLives = afterLoss + bonus;
        const code = `let lives = ${start};\nlives = lives - ${lost};\nconsole.log(lives);\nlives = lives + ${bonus};\nconsole.log(lives);`;
        return makeSet("lives-and-bonus", "Subtract and add", code, [
          { prompt: "How many lives do you start with?", answer: start },
          { prompt: "What does the first console.log(lives) print?", answer: afterLoss },
          { prompt: "How many lives are left after the bonus is added?", answer: finalLives },
        ]);
      },
    },
    {
      id: "combine-variables",
      build() {
        const first = randomInt(2, 15);
        const second = randomInt(3, 14);
        const bonus = randomInt(1, 9);
        const total = first + second;
        const finalTotal = total + bonus;
        const code = `let redCards = ${first};\nlet blueCards = ${second};\nlet totalCards = redCards + blueCards;\nconsole.log(totalCards);\ntotalCards = totalCards + ${bonus};\nconsole.log(totalCards);`;
        return makeSet("combine-variables", "Add two variables", code, [
          { prompt: "What value is stored in redCards?", answer: first },
          { prompt: "What does the first console.log(totalCards) print?", answer: total },
          { prompt: "What is totalCards after the bonus is added?", answer: finalTotal },
        ]);
      },
    },
    {
      id: "counter-steps",
      build() {
        const start = randomInt(1, 8);
        const step = randomInt(2, 6);
        const multiplier = randomInt(2, 4);
        const afterIncrement = start + 1;
        const afterStep = afterIncrement + step;
        const finalCount = afterStep * multiplier;
        const code = `let counter = ${start};\ncounter++;\nconsole.log(counter);\ncounter += ${step};\nconsole.log(counter);\ncounter *= ${multiplier};\nconsole.log(counter);`;
        return makeSet("counter-steps", "Counter steps", code, [
          { prompt: "What does the first console.log(counter) print?", answer: afterIncrement },
          { prompt: "What does the second console.log(counter) print?", answer: afterStep },
          { prompt: "What is counter after it is multiplied?", answer: finalCount },
        ]);
      },
    },
    {
      id: "shopping-total",
      build() {
        const price = randomInt(3, 14);
        const quantity = randomInt(2, 6);
        const subtotal = price * quantity;
        const discount = randomInt(1, Math.min(9, subtotal - 1));
        const finalTotal = subtotal - discount;
        const code = `let itemPrice = ${price};\nlet quantity = ${quantity};\nlet total = itemPrice * quantity;\nconsole.log(total);\ntotal = total - ${discount};\nconsole.log(total);`;
        return makeSet("shopping-total", "Shopping total", code, [
          { prompt: "How much does one item cost?", answer: price },
          { prompt: "What total is printed before the discount?", answer: subtotal },
          { prompt: "What total is printed after the discount?", answer: finalTotal },
        ]);
      },
    },
    {
      id: "array-count",
      build() {
        const collections = [
          { name: "colors", items: ["red", "blue"], added: "green" },
          { name: "pets", items: ["cat", "dog", "rabbit"], added: "fish" },
          { name: "planets", items: ["Mars", "Venus"], added: "Earth" },
          { name: "snacks", items: ["pear", "plum", "mango"], added: "peach" },
          { name: "tools", items: ["pen", "ruler"], added: "eraser" },
        ];
        const list = pick(collections);
        const initialLength = list.items.length;
        const literal = `[${list.items.map((item) => JSON.stringify(item)).join(", ")}]`;
        const code = `let ${list.name} = ${literal};\n${list.name}.push(${JSON.stringify(list.added)});\nconsole.log(${list.name}.length);\n${list.name}.pop();\nconsole.log(${list.name}.length);`;
        return makeSet("array-count", "Array count", code, [
          { prompt: `How many items are in ${list.name} before push?`, answer: initialLength },
          { prompt: `What does console.log(${list.name}.length) print after push?`, answer: initialLength + 1 },
          { prompt: `How many items remain after pop?`, answer: initialLength },
        ]);
      },
    },
    {
      id: "word-builder",
      build() {
        const word = pick(["star", "moon", "code", "space", "sun", "orbit"]);
        const ending = pick(["ship", "light", "beam", "walk", "shine"]);
        const combined = word + ending;
        const code = `let word = ${JSON.stringify(word)};\nlet newWord = word + ${JSON.stringify(ending)};\nconsole.log(newWord);\nword = word + "!";\nconsole.log(word);`;
        return makeSet("word-builder", "Word builder", code, [
          { prompt: "What value is stored in word at the start?", answer: word },
          { prompt: "What does console.log(newWord) print?", answer: combined },
          { prompt: "What does console.log(word) print after adding an exclamation mark?", answer: `${word}!` },
        ]);
      },
    },
    {
      id: "temperature-check",
      build() {
        const temperature = randomInt(10, 26);
        const warmAt = randomInt(15, 24);
        const increase = randomInt(2, 9);
        const firstResult = temperature >= warmAt;
        const finalResult = temperature + increase >= warmAt;
        const code = `let temperature = ${temperature};\nlet warmAt = ${warmAt};\nlet isWarm = temperature >= warmAt;\nconsole.log(isWarm);\ntemperature = temperature + ${increase};\nconsole.log(temperature >= warmAt);`;
        return makeSet("temperature-check", "Temperature check", code, [
          { prompt: "What value is stored in temperature at the start?", answer: temperature },
          { prompt: "What does the first console.log(isWarm) print? Type true or false.", answer: firstResult },
          { prompt: "After the temperature rises, is it at least warmAt? Type true or false.", answer: finalResult },
        ]);
      },
    },
    {
      id: "division-leftovers",
      build() {
        const slices = randomInt(10, 32);
        const friends = randomInt(2, 6);
        const each = Math.floor(slices / friends);
        const leftover = slices % friends;
        const code = `let slices = ${slices};\nlet friends = ${friends};\nlet eachFriendGets = Math.floor(slices / friends);\nlet leftover = slices % friends;\nconsole.log(eachFriendGets);\nconsole.log(leftover);`;
        return makeSet("division-leftovers", "Division and remainder", code, [
          { prompt: "How many slices are there to share?", answer: slices },
          { prompt: "How many slices does each friend get?", answer: each },
          { prompt: "How many slices are left over?", answer: leftover },
        ]);
      },
    },
    {
      id: "bonus-function",
      build() {
        const points = randomInt(3, 16);
        const bonus = randomInt(2, 9);
        const total = points + bonus;
        const doubled = total * 2;
        const code = `function addBonus(points, bonus) {\n  return points + bonus;\n}\nlet points = ${points};\nlet bonus = ${bonus};\nlet total = addBonus(points, bonus);\nconsole.log(total);\ntotal = total * 2;\nconsole.log(total);`;
        return makeSet("bonus-function", "A tiny function", code, [
          { prompt: "What value is stored in points?", answer: points },
          { prompt: "What does addBonus return?", answer: total },
          { prompt: "What is total after it is doubled?", answer: doubled },
        ]);
      },
    },
  ];

  function getLastSignature() {
    try {
      return window.localStorage.getItem(LAST_SET_KEY) || lastGeneratedSignature;
    } catch (error) {
      return lastGeneratedSignature;
    }
  }

  function generateQuestionSet() {
    const previousSignature = getLastSignature();
    let generated;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const builder = pick(setBuilders);
      generated = builder.build();
      if (generated.signature !== previousSignature) break;
    }
    if (generated.signature === previousSignature) {
      let previousId = "";
      try { previousId = JSON.parse(previousSignature)[0]; } catch (error) { /* no saved signature */ }
      const differentBuilder = setBuilders.find((builder) => builder.id !== previousId) || setBuilders[0];
      generated = differentBuilder.build();
    }

    lastGeneratedSignature = generated.signature;
    try { window.localStorage.setItem(LAST_SET_KEY, generated.signature); } catch (error) { /* storage may be disabled */ }
    return generated;
  }

  function setOutput(text, isError = false) {
    output.textContent = text;
    output.classList.toggle("output-error", isError);
  }

  function resetConsole() {
    status.textContent = "Ready";
    output.classList.remove("output-error");
    output.innerHTML = '<span class="output-placeholder">Run the code to see what console.log prints.</span>';
  }

  // Execute learner edits in a separate sandboxed frame, not in the lesson page.
  frame.srcdoc = `<!doctype html>
<meta charset="utf-8">
<script>
  addEventListener("message", (event) => {
    if (event.source !== parent || !event.data || event.data.type !== "run") return;
    const { id, code } = event.data;
    const lines = [];
    const safeText = (value) => {
      try { return typeof value === "string" ? value : JSON.stringify(value); }
      catch { return String(value); }
    };
    const captured = { log: (...values) => lines.push(values.map(safeText).join(" ")) };
    try {
      const execute = new Function("console", String(code) + "\\n;return typeof score === 'undefined' ? undefined : score;");
      const finalScore = execute(captured);
      parent.postMessage({ type: "result", id, lines, finalScore }, "*");
    } catch (error) {
      parent.postMessage({ type: "error", id, message: error && error.message ? error.message : String(error) }, "*");
    }
  });
</script>`;

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
      const hasQuotes = (answer.startsWith('"') && answer.endsWith('"')) || (answer.startsWith("'") && answer.endsWith("'"));
      return (hasQuotes ? answer.slice(1, -1) : answer) === expected;
    }
    return false;
  }

  function renderQuestions(set) {
    currentSet = set;
    solvedCount = 0;
    editor.value = set.code;
    resetConsole();
    exerciseTopic.textContent = set.topic;
    setProgress.textContent = `0 of ${set.questions.length} correct — answer each to unlock a new set.`;
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
      input.placeholder = typeof question.answer === "boolean" ? "true or false" : typeof question.answer === "number" ? "Type a number" : "Type the text";
      const checkButton = document.createElement("button");
      checkButton.className = "check";
      checkButton.type = "button";
      checkButton.textContent = "Check";
      const feedback = document.createElement("p");
      feedback.className = "feedback";
      feedback.setAttribute("aria-live", "polite");

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
          feedback.textContent = "Not quite yet. Trace the example and try again.";
          feedback.className = "feedback retry";
          input.select();
        }
      };

      checkButton.addEventListener("click", checkAnswer);
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") checkAnswer();
      });
      row.append(label, input, checkButton);
      content.append(title, row, feedback);
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

  document.addEventListener("fullscreenchange", () => {
    const button = document.getElementById("fullscreenBtn");
    const active = Boolean(document.fullscreenElement);
    button.textContent = active ? "↙ Exit full screen" : "⛶ Full screen";
    button.setAttribute("aria-label", active ? "Exit full screen" : "Make lesson full screen");
  });
})();
