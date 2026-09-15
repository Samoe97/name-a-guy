function normalizeAnswer(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const scoreEl = document.getElementById("score");
const streakEl = document.getElementById("streak");
const livesLeftEl = document.getElementById("lives-left");
const promptTextEl = document.getElementById("prompt-text");
const answerInputEl = document.getElementById("answer-input");
const feedbackEl = document.getElementById("feedback");
const answerForm = document.getElementById("answer-form");
const newGameBtn = document.getElementById("new-game-btn");
const skipBtn = document.getElementById("skip-btn");
const difficultyBadgeEl = document.getElementById("difficulty-badge");
const suggestionListEl = document.getElementById("suggestions");
const sharedTagsEl = document.getElementById("shared-tags");
const hint1El = document.getElementById("hint-1");
const hint2El = document.getElementById("hint-2");
const resultEl = document.getElementById("result");
const hintListEl = document.getElementById("hint-list");
const previousGuessesEl = document.getElementById("previous-guesses");

const maxGuesses = 6;
const hint1Guess = 2;
const hint2Guess = 4;

let guys = [];
let currentGuy = null;
let guesses = 0;
let score = 0;
let streak = 0;
let isRoundOver = false;
let isSelecting = false;
let revealedTags = [];
let previousGuesses = [];
let usedGuyIds = new Set();

function getTags(guy) {
  return [...new Set(guy.categories || [])].filter(Boolean);
}

function hideSuggestions() {
  suggestionListEl.classList.remove("visible");
  suggestionListEl.innerHTML = "";
}

function setFeedback(message, state = "info") {
  feedbackEl.textContent = message;
  feedbackEl.className = `feedback ${state}`;
}

function renderSharedTags() {
  sharedTagsEl.innerHTML = revealedTags.length
    ? revealedTags.map((tag) => `<span class="tag">${tag}</span>`).join("")
    : '<span class="empty-tags">No shared tags yet</span>';
  resultEl.classList.add("visible");
}

function renderPreviousGuesses() {
  previousGuessesEl.innerHTML = previousGuesses.length
    ? previousGuesses.map(({ name, isCorrect }) => `<li><span>${name}</span><span class="${isCorrect ? "correct-label" : "incorrect-label"}">${isCorrect ? "Correct" : "Incorrect"}</span></li>`).join("")
    : "";
  promptTextEl.textContent = previousGuesses.length ? "Previous guesses" : "Name a Guy";
  previousGuessesEl.classList.toggle("visible", previousGuesses.length > 0);
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
  if (guesses >= 1 && currentGuy.birthYear) hints.push(`Born in: ${currentGuy.birthYear}`);
  if (guesses >= 2 && currentGuy.categories?.[0]) hints.push(`Category clue: ${currentGuy.categories[0]}`);
  if (guesses >= 3 && currentGuy.categories?.[1]) hints.push(`Another category clue: ${currentGuy.categories[1]}`);
  if (guesses >= 4) hints.push(`Status clue: ${currentGuy.isDeceased ? "This guy is deceased" : "This guy is living"}`);
  hintListEl.innerHTML = hints.map((hint) => `<li>${hint}</li>`).join("");
  resultEl.classList.add("visible");
}

function finishRound(message, state) {
  isRoundOver = true;
  answerInputEl.disabled = true;
  document.getElementById("submit-btn").disabled = true;
  skipBtn.disabled = true;
  setFeedback(message, state);
}

function chooseGuy() {
  let availableGuys = guys.filter((guy) => !usedGuyIds.has(guy.id));
  if (!availableGuys.length) {
    usedGuyIds.clear();
    availableGuys = guys;
  }
  currentGuy = availableGuys[Math.floor(Math.random() * availableGuys.length)];
  usedGuyIds.add(currentGuy.id);
  guesses = 0;
  isRoundOver = false;
  promptTextEl.textContent = "Name a Guy";
  difficultyBadgeEl.textContent = `Guess 1 of ${maxGuesses}`;
  difficultyBadgeEl.className = "difficulty-badge easy";
  answerInputEl.disabled = false;
  document.getElementById("submit-btn").disabled = false;
  skipBtn.disabled = false;
  answerInputEl.value = "";
  livesLeftEl.textContent = String(maxGuesses);
  revealedTags = [];
  previousGuesses = [];
  sharedTagsEl.innerHTML = "";
  hintListEl.innerHTML = "";
  renderPreviousGuesses();
  resultEl.classList.remove("visible");
  hint1El.textContent = "";
  hint1El.parentElement.classList.remove("visible");
  hint2El.textContent = "";
  hint2El.parentElement.classList.remove("visible");
  hideSuggestions();
  setFeedback("Make your guess.");
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
  const targetTags = getTags(currentGuy);
  const sharedTags = getTags(guess).filter((tag) => targetTags.includes(tag));
  revealedTags = sharedTags;
  renderSharedTags();
  renderProgressiveHints();
  difficultyBadgeEl.textContent = `Guess ${Math.min(guesses + 1, maxGuesses)} of ${maxGuesses}`;

  if (isCorrect) {
    score += 10 + streak * 2;
    streak += 1;
    scoreEl.textContent = String(score);
    streakEl.textContent = String(streak);
    finishRound(`Correct! You named ${currentGuy.name}.`, "success");
    return;
  }

  streak = 0;
  streakEl.textContent = "0";
  livesLeftEl.textContent = String(maxGuesses - guesses);
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
  score = 0;
  streak = 0;
  scoreEl.textContent = "0";
  streakEl.textContent = "0";
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

fetch("./guys.json")
  .then((response) => {
    if (!response.ok) throw new Error("Could not load guys.json");
    return response.json();
  })
  .then((data) => {
    guys = [...new Map(data.map((guy) => [normalizeAnswer(guy.name), guy])).values()];
    chooseGuy();
  })
  .catch(() => setFeedback("The guy list could not be loaded.", "error"));
