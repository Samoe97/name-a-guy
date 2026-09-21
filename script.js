function normalizeAnswer(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const promptTextEl = document.getElementById("prompt-text");
const promptLabelEl = document.getElementById("prompt-label");
const promptCardEl = document.querySelector(".prompt-card");
const answerInputEl = document.getElementById("answer-input");
const answerForm = document.getElementById("answer-form");
const newGameBtn = document.getElementById("new-game-btn");
const skipBtn = document.getElementById("skip-btn");
const guessDotsEl = document.getElementById("guess-dots");
const suggestionListEl = document.getElementById("suggestions");
const sharedTagsEl = document.getElementById("shared-tags");
const hint1El = document.getElementById("hint-1");
const hint2El = document.getElementById("hint-2");
const resultEl = document.getElementById("result");
const hintListEl = document.getElementById("hint-list");
const previousGuessesEl = document.getElementById("previous-guesses");
const difficultyOptionsEl = document.getElementById("difficulty-options");
const modeOptionsEl = document.getElementById("mode-options");

const maxGuesses = 6;
const hint1Guess = 2;
const hint2Guess = 4;

const modeConfig = {
  guy: { file: "guys.json", label: "guy", title: "Guy", theme: null },
  gal: { file: "gals.json", label: "gal", title: "Gal", theme: "theme-gal" }
};

let guys = [];
let currentGuy = null;
let guesses = 0;
let isRoundOver = false;
let isSelecting = false;
let revealedTags = [];
let previousGuesses = [];
let usedGuyNames = new Set();
let difficulty = "easy";
let mode = "guy";

function getTags(guy) {
  return [...new Set(guy.categories || [])].filter(Boolean);
}

function getRevealedCategoryTags() {
  const revealedCategories = [];
  if (guesses >= 1 && currentGuy?.categories?.[0]) {
    revealedCategories.push(currentGuy.categories[0]);
  }
  if (guesses >= 4) {
    const categoryCount = guesses >= maxGuesses
      ? (currentGuy.categories || []).length
      : 1 + (guesses - 3) * 2;
    revealedCategories.push(...(currentGuy.categories || []).slice(1, categoryCount));
  }
  return new Set(revealedCategories);
}

function hideSuggestions() {
  suggestionListEl.classList.remove("visible");
  suggestionListEl.innerHTML = "";
}

function setFeedback(message, state = "info") {
}

function renderSharedTags() {
  sharedTagsEl.innerHTML = revealedTags.length
    ? revealedTags.map((tag) => `<span class="tag">${tag}</span>`).join("")
    : '<span class="empty-tags">No shared tags yet</span>';
}

function renderPreviousGuesses() {
  previousGuessesEl.innerHTML = previousGuesses.length
    ? previousGuesses.map(({ name, isCorrect }) => `<li><span>${name}</span><span class="${isCorrect ? "correct-label" : "incorrect-label"}" aria-label="${isCorrect ? "Correct" : "Incorrect"}">${isCorrect ? "✓" : "X"}</span></li>`).join("")
    : "";
  previousGuessesEl.classList.toggle("visible", previousGuesses.length > 0);
}

function renderGuessDots() {
  guessDotsEl.innerHTML = Array.from({ length: maxGuesses }, (_, index) => {
    const guess = previousGuesses[index];
    const state = guess ? (guess.isCorrect ? "correct" : "incorrect") : "unused";
    const label = guess
      ? `${guess.isCorrect ? "Correct" : "Incorrect"} guess ${index + 1}`
      : `Unused guess ${index + 1}`;
    return `<span class="guess-dot ${state}" aria-label="${label}" role="img"></span>`;
  }).join("");
  guessDotsEl.setAttribute("aria-label", `${maxGuesses - previousGuesses.length} guesses remaining`);
}

function showHint1() {
  hint1El.textContent = currentGuy.hint1;
  hint1El.parentElement.classList.add("visible");
}

function showHint2() {
  hint2El.textContent = currentGuy.hint2;
  hint2El.parentElement.classList.add("visible");
}

function renderProgressiveHints() {
  const hints = [];
  if (guesses >= 1 && currentGuy.categories?.[0]) {
    hints.push(`Profession: ${currentGuy.categories[0]}`);
  }

  if (guesses >= 2) {
    if (currentGuy.birthYear && currentGuy.age) {
      hints.push(`Birth year: ${currentGuy.birthYear} (Age ${currentGuy.age})${currentGuy.isDeceased ? " (Deceased)" : ""}`);
    }
  }

  if (guesses >= 3 && currentGuy.ethnicity) {
    hints.push(currentGuy.ethnicity);
  }

  if (guesses >= 4) {
    const additionalCategoryStart = 1;
    const additionalCategoryCount = guesses >= maxGuesses
      ? (currentGuy.categories || []).length
      : (guesses - 3) * 2;
    const additionalCategories = (currentGuy.categories || []).slice(
      additionalCategoryStart,
      additionalCategoryStart + additionalCategoryCount
    );
    additionalCategories.forEach((category) => hints.push(category));
  }

  hintListEl.innerHTML = hints.map((hint) => `<li>${hint}</li>`).join("");
}

function finishRound(message, state) {
  isRoundOver = true;
  promptLabelEl.textContent = "CORRECT ANSWER";
  promptTextEl.textContent = currentGuy.name;
  promptCardEl.className = `prompt-card ${state === "success" ? "answer-success" : "answer-failure"}`;
  if (state === "success") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  answerInputEl.disabled = true;
  document.getElementById("submit-btn").disabled = true;
  skipBtn.disabled = true;
  setFeedback(message, state);
}

function chooseGuy() {
  const sortedGuys = [...guys].sort((first, second) => second.notorietyScore - first.notorietyScore);
  const fifthSize = Math.ceil(sortedGuys.length * 0.2);
  const difficultyRanges = {
    easy: sortedGuys.slice(0, fifthSize),
    medium: sortedGuys.slice(fifthSize, sortedGuys.length - fifthSize),
    hard: sortedGuys.slice(sortedGuys.length - fifthSize)
  };
  const difficultyGuys = difficultyRanges[difficulty];
  let availableGuys = difficultyGuys.filter((guy) => !usedGuyNames.has(normalizeAnswer(guy.name)));
  if (!availableGuys.length) {
    for (const guy of difficultyGuys) usedGuyNames.delete(normalizeAnswer(guy.name));
    availableGuys = difficultyGuys;
  }
  currentGuy = availableGuys[Math.floor(Math.random() * availableGuys.length)];
  usedGuyNames.add(normalizeAnswer(currentGuy.name));
  guesses = 0;
  isRoundOver = false;
  promptLabelEl.textContent = "";
  promptTextEl.textContent = "";
  promptCardEl.className = "prompt-card";
  renderGuessDots();
  answerInputEl.disabled = false;
  document.getElementById("submit-btn").disabled = false;
  skipBtn.disabled = false;
  answerInputEl.value = "";
  revealedTags = [];
  previousGuesses = [];
  renderGuessDots();
  sharedTagsEl.innerHTML = "";
  hintListEl.innerHTML = "";
  renderPreviousGuesses();
  resultEl.classList.remove("visible");
  hint1El.textContent = "";
  hint1El.parentElement.classList.remove("visible");
  hint2El.textContent = "";
  hint2El.parentElement.classList.remove("visible");
  hideSuggestions();
  setFeedback("");
  answerInputEl.focus();
}

function renderSuggestions() {
  if (isRoundOver || isSelecting) return;

  const inputValue = normalizeAnswer(answerInputEl.value);
  if (!inputValue) {
    hideSuggestions();
    return;
  }

  const matches = guys
    .filter((guy) => normalizeAnswer(guy.name).includes(inputValue))
    .slice(0, 12);

  if (!matches.length) {
    hideSuggestions();
    return;
  }

  suggestionListEl.innerHTML = matches
    .map((guy) => `<button class="suggestion-item" type="button" data-value="${guy.name}">${guy.name}</button>`)
    .join("");
  suggestionListEl.classList.add("visible");
}

function selectSuggestion(value) {
  isSelecting = true;
  answerInputEl.value = value;
  hideSuggestions();
  answerInputEl.focus();
  setTimeout(() => { isSelecting = false; }, 100);
}

function focusSuggestion(direction) {
  const items = [...document.querySelectorAll(".suggestion-item")];
  if (!items.length) return;
  const currentIndex = items.indexOf(document.activeElement);
  const nextIndex = currentIndex < 0 ? (direction > 0 ? 0 : items.length - 1) : currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= items.length) answerInputEl.focus();
  else items[nextIndex].focus();
}

function submitGuess(value) {
  const guess = guys.find((guy) => normalizeAnswer(guy.name) === normalizeAnswer(value));
  if (!guess) {
    setFeedback("Choose a name from the suggestions.", "error");
    return;
  }

  const isCorrect = normalizeAnswer(guess.name) === normalizeAnswer(currentGuy.name);
  guesses += 1;
  previousGuesses.push({ name: guess.name, isCorrect });
  renderPreviousGuesses();
  renderGuessDots();
  const targetTags = getTags(currentGuy);
  const revealedCategoryTags = getRevealedCategoryTags();
  const sharedTags = getTags(guess).filter(
    (tag) => targetTags.includes(tag) && !revealedCategoryTags.has(tag)
  );
  revealedTags = sharedTags;
  renderSharedTags();
  renderProgressiveHints();
  if (isCorrect) {
    finishRound(`Correct! You named ${currentGuy.name}.`, "success");
    return;
  }

  if (guesses >= hint1Guess) showHint1();
  if (guesses >= hint2Guess) showHint2();
  if (guesses >= maxGuesses) {
    finishRound(`The answer was ${currentGuy.name}.`, "reveal");
    return;
  }

  setFeedback("Keep guessing.", "info");
  answerInputEl.value = "";
  hideSuggestions();
}

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!isRoundOver) submitGuess(answerInputEl.value.trim());
});

skipBtn.addEventListener("click", () => {
  if (isRoundOver) return;
  guesses = maxGuesses;
  renderSharedTags();
  renderProgressiveHints();
  showHint1();
  showHint2();
  finishRound(`The answer was ${currentGuy.name}.`, "reveal");
});

newGameBtn.addEventListener("click", () => {
  chooseGuy();
});

difficultyOptionsEl.addEventListener("change", (event) => {
  difficulty = event.target.value;
  chooseGuy();
});

answerInputEl.addEventListener("input", renderSuggestions);
answerInputEl.addEventListener("focus", renderSuggestions);
answerInputEl.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") { event.preventDefault(); focusSuggestion(1); }
  if (event.key === "ArrowUp") { event.preventDefault(); focusSuggestion(-1); }
  if (event.key === "Escape") { hideSuggestions(); answerInputEl.focus(); }
});

suggestionListEl.addEventListener("mousedown", (event) => event.preventDefault());
suggestionListEl.addEventListener("click", (event) => {
  const item = event.target.closest(".suggestion-item");
  if (item) selectSuggestion(item.dataset.value);
});
suggestionListEl.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") { event.preventDefault(); focusSuggestion(1); }
  if (event.key === "ArrowUp") { event.preventDefault(); focusSuggestion(-1); }
  if (event.key === "Enter" || event.key === " ") {
    const item = document.activeElement;
    if (item.classList.contains("suggestion-item")) { event.preventDefault(); selectSuggestion(item.dataset.value); }
  }
});

document.addEventListener("click", (event) => {
  if (!answerInputEl.contains(event.target) && !suggestionListEl.contains(event.target)) hideSuggestions();
});

function getDataUrls(fileName) {
  return [...new Set([
    new URL(fileName, document.baseURI).href,
    new URL(`../${fileName}`, document.baseURI).href,
    new URL(`/name-a-guy/${fileName}`, window.location.origin).href
  ])];
}

function fetchGuysData(urls) {
  const [url, ...remainingUrls] = urls;
  if (!url) return Promise.reject(new Error("Could not find data file in any deployment path"));

  return fetch(url, { cache: "no-store" }).then((response) => {
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText} at ${url}`);
    }
    return response.json();
  }).catch((error) => {
    if (!remainingUrls.length) throw error;
    return fetchGuysData(remainingUrls);
  });
}

function applyModeUi() {
  const config = modeConfig[mode];
  document.body.classList.toggle("theme-gal", config.theme === "theme-gal");
  answerInputEl.placeholder = `Type the ${config.label}'s name...`;
  document.title = `Name a ${config.title}`;
}

function loadModeData(nextMode) {
  const config = modeConfig[nextMode];
  return fetchGuysData(getDataUrls(config.file)).then((data) => {
    if (!Array.isArray(data)) throw new Error(`${config.file} must contain an array`);
    const people = [...new Map(data.map((guy) => [normalizeAnswer(guy.name), guy])).values()];
    if (!people.length) throw new Error(`${config.file} contains no people`);
    mode = nextMode;
    guys = people;
    usedGuyNames = new Set();
    applyModeUi();
    chooseGuy();
  });
}

function getModeFromHash() {
  const hashMode = window.location.hash.replace("#", "").toLowerCase();
  return modeConfig[hashMode] ? hashMode : "guy";
}

modeOptionsEl.addEventListener("change", (event) => {
  const nextMode = event.target.value;
  loadModeData(nextMode).then(() => {
    window.location.hash = nextMode;
  }).catch((error) => {
    console.error("NameAGuy mode switch failed:", error);
    setFeedback(`The ${modeConfig[nextMode].label} list could not be loaded.`, "error");
    modeOptionsEl.value = mode;
  });
});

window.addEventListener("hashchange", () => {
  const nextMode = getModeFromHash();
  if (nextMode === mode) return;
  loadModeData(nextMode).then(() => {
    modeOptionsEl.value = nextMode;
  }).catch((error) => {
    console.error("NameAGuy mode switch failed:", error);
    setFeedback(`The ${modeConfig[nextMode].label} list could not be loaded.`, "error");
  });
});

mode = getModeFromHash();
modeOptionsEl.value = mode;
loadModeData(mode).then(() => {
  window.location.hash = mode;
}).catch((error) => {
  console.error("NameAGuy data load failed:", error);
  setFeedback("The guy list could not be loaded.", "error");
});
