// Helper function for normalizing answers
function normalizeAnswer(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isFullNameAnswer(value) {
  return normalizeAnswer(value).split(" ").filter(Boolean).length > 1;
}

function getValidPromptAnswers(prompt) {
  return (prompt?.answers || []).filter((answer) => isFullNameAnswer(answer));
}

// Game data - deduplicated prompts
const difficultyLevels = [
  {
    label: "easy",
    prompts: [
      { prompt: "Name a guy who was a U.S. president.", answers: ["Barack Obama", "George Washington", "Joe Biden", "Donald Trump", "Abraham Lincoln", "Franklin D. Roosevelt", "Thomas Jefferson", "John F. Kennedy", "Ronald Reagan", "Bill Clinton", "James Madison", "Theodore Roosevelt", "Woodrow Wilson", "Harry S. Truman", "Dwight D. Eisenhower", "Jimmy Carter", "George H. W. Bush", "George W. Bush"], category: "History" },
      { prompt: "Name a guy who won an Oscar.", answers: ["Leonardo DiCaprio", "Tom Hanks", "Brad Pitt", "Matthew McConaughey", "Denzel Washington", "Javier Bardem", "Morgan Freeman", "Anthony Hopkins", "Gary Oldman", "Jeff Bridges", "Joaquin Phoenix", "Kevin Costner", "Sean Penn", "Daniel Day-Lewis", "Russell Crowe", "Harrison Ford", "Cillian Murphy", "Mahershala Ali", "Forest Whitaker", "Adrien Brody"], category: "Entertainment" },
      { prompt: "Name a guy who played in the NBA.", answers: ["LeBron James", "Michael Jordan", "Stephen Curry", "Kawhi Leonard", "Kevin Durant", "Giannis Antetokounmpo", "Kobe Bryant", "Russell Westbrook", "Paul George", "Jayson Tatum", "Anthony Davis", "Jimmy Butler", "Nikola Jokic", "Joel Embiid", "Tim Duncan", "Magic Johnson", "Larry Bird", "Shaquille O'Neal", "Dwyane Wade", "Chris Paul"], category: "Sports" },
      { prompt: "Name a guy who was a famous inventor.", answers: ["Thomas Edison", "Alexander Graham Bell", "Nikola Tesla", "Guglielmo Marconi", "Joseph Swan", "Benjamin Franklin", "Eli Whitney", "James Watt", "Leonardo da Vinci", "Henry Ford", "George Washington Carver", "Hedy Lamarr", "Johannes Gutenberg", "Samuel Morse"], category: "Science" },
      { prompt: "Name a guy who won a Super Bowl.", answers: ["Tom Brady", "Patrick Mahomes", "Joe Montana", "Troy Aikman", "Peyton Manning", "Russell Wilson", "Aaron Rodgers", "Eli Manning", "Kurt Warner", "John Elway", "Rob Gronkowski", "Julian Edelman", "Tyreek Hill", "Larry Fitzgerald", "Tedy Bruschi", "Nick Foles", "Trey Burton", "Fletcher Cox", "Brandon Graham", "Lane Johnson"], category: "Sports" },
      { prompt: "Name a guy who was a famous actor.", answers: ["Arnold Schwarzenegger", "Tom Hanks", "Morgan Freeman", "Leonardo DiCaprio", "Brad Pitt", "Tom Cruise", "Will Smith", "Dwayne Johnson", "Keanu Reeves", "Hugh Jackman", "Al Pacino", "Daniel Craig", "Sylvester Stallone", "Christian Bale", "Steve Carell", "Matt Damon", "Ryan Reynolds", "Mark Wahlberg", "Jason Statham", "George Clooney"], category: "Entertainment" },
      { prompt: "Name a guy who won a Grammy.", answers: ["Stevie Wonder", "Bruno Mars", "John Legend", "Pharrell Williams", "Kanye West", "Jay-Z", "Ed Sheeran", "John Mayer", "Kendrick Lamar", "Sam Smith", "Usher", "Drake", "Harry Styles", "Chris Brown", "The Weeknd", "Snoop Dogg", "Justin Bieber", "Travis Scott", "Eminem", "Post Malone"], category: "Music" },
      { prompt: "Name a guy who was a professional soccer player.", answers: ["Lionel Messi", "Cristiano Ronaldo", "Ronaldinho", "Zinedine Zidane", "Wayne Rooney", "David Beckham", "Kylian Mbappé", "Gianfranco Zola", "Paolo Maldini", "Jude Bellingham", "Franz Beckenbauer", "Thiago Silva", "Paul Scholes", "Ronaldo Fenômeno", "Lothar Matthäus", "Roberto Baggio", "Andriy Shevchenko", "Xavi Hernandez", "Iniesta", "Sergio Ramos"], category: "Sports" },
      { prompt: "Name a guy who won a gold medal in the Olympics as a swimmer.", answers: ["Michael Phelps", "Ryan Lochte", "Mark Spitz", "Ian Thorpe", "Caeleb Dressel", "Matt Biondi", "Mitch Larkin", "Tom Dolan"], category: "Sports" },
      { prompt: "Name a guy who was a famous musician.", answers: ["Elton John", "Freddie Mercury", "David Bowie", "Paul McCartney", "Prince", "Bob Dylan", "John Lennon", "Stevie Wonder", "Bruce Springsteen", "Eric Clapton", "Carlos Santana", "Roger McGuinn", "Ludwig van Beethoven", "Kurt Cobain", "Bono", "John Mayer", "Justin Timberlake", "Bruno Mars", "The Weeknd", "Drake"], category: "Music" },
      { prompt: "Name a guy who won a Nobel Prize.", answers: ["Albert Einstein", "Isaac Newton", "Werner Heisenberg", "Paul Dirac", "Erwin Schrödinger", "Richard Feynman", "Niels Bohr", "Enrico Fermi", "Max Planck", "Bertrand Russell", "Marie Curie", "Stephen Hawking", "James Watson", "Peter Higgs"], category: "Science" },
      { prompt: "Name a guy who was a famous author.", answers: ["George Orwell", "Stephen King", "Ernest Hemingway", "Mark Twain", "Charles Dickens", "H.G. Wells", "George R.R. Martin", "Terry Pratchett", "Dan Brown", "J.R.R. Tolkien", "Jane Austen", "Jules Verne", "Arthur Conan Doyle", "Ray Bradbury"], category: "Literature" },
      { prompt: "Name a guy who was a famous boxer.", answers: ["Muhammad Ali", "Mike Tyson", "Floyd Mayweather", "Manny Pacquiao", "Oscar De La Hoya", "Sugar Ray Leonard", "Evander Holyfield", "Joe Frazier", "Lennox Lewis", "Canelo Alvarez", "Gennady Golovkin", "Andre Ward", "Buster Douglas", "Wladimir Klitschko"], category: "Sports" },
      { prompt: "Name a guy who won a Stanley Cup.", answers: ["Sidney Crosby", "Patrick Kane", "Alexander Ovechkin", "Connor McDavid", "Jonathan Toews", "Pavel Datsyuk", "Joe Sakic", "Bobby Orr", "Evgeni Malkin", "Mario Lemieux", "Patrick Roy", "Jaromir Jagr", "Nicklas Lidstrom", "Zdeno Chara"], category: "Sports" },
      { prompt: "Name a guy who was a famous comedian.", answers: ["Robin Williams", "Jim Carrey", "Kevin Hart", "Jerry Seinfeld", "Dave Chappelle", "Seth Rogen", "Billy Crystal", "John Mulaney", "Ricky Gervais", "Trevor Noah", "Eddie Murphy", "Chris Rock", "Bo Burnham", "Amy Schumer"], category: "Entertainment" },
      { prompt: "Name a guy who was a famous scientist.", answers: ["Albert Einstein", "Isaac Newton", "Charles Darwin", "Stephen Hawking", "Nikola Tesla", "Erwin Schrödinger", "Richard Feynman", "Niels Bohr", "Enrico Fermi", "Louis Pasteur", "Galileo Galilei", "Gregor Mendel", "Alan Turing", "Neil deGrasse Tyson"], category: "Science" },
      { prompt: "Name a member of The Beatles.", answers: ["John Lennon", "Paul McCartney", "George Harrison", "Ringo Starr", "Pete Best", "Stuart Sutcliffe"], category: "Music" },
      { prompt: "Name a James Bond actor.", answers: ["Sean Connery", "George Lazenby", "Roger Moore", "Timothy Dalton", "Pierce Brosnan", "Daniel Craig", "David Niven"], category: "Entertainment" },
      { prompt: "Name a member of U2.", answers: ["Bono", "The Edge", "Adam Clayton", "Larry Mullen Jr."], category: "Music" },
      { prompt: "Name a member of Queen.", answers: ["Freddie Mercury", "Brian May", "Roger Taylor", "John Deacon"], category: "Music" }
    ]
  },
  {
    label: "medium",
    prompts: [
      { prompt: "Name a U.S. Vice President.", answers: ["Joe Biden", "Kamala Harris", "Mike Pence", "Dick Cheney", "Al Gore", "Walter Mondale", "Lyndon B. Johnson", "Hubert Humphrey", "Richard Nixon", "Spiro Agnew"], category: "History" },
      { prompt: "Name a Roman Emperor.", answers: ["Julius Caesar", "Augustus Caesar", "Nero", "Tiberius", "Caligula", "Claudius", "Vespasian", "Titus", "Domitian", "Trajan", "Hadrian", "Marcus Aurelius", "Constantine the Great"], category: "History" },
      { prompt: "Name a famous Renaissance painter.", answers: ["Leonardo da Vinci", "Michelangelo Buonarroti", "Raphael Sanzio", "Sandro Botticelli", "Donatello", "Giovanni Bellini", "Titian"], category: "Art" },
      { prompt: "Name a composer of classical music.", answers: ["Wolfgang Amadeus Mozart", "Ludwig van Beethoven", "Georg Friedrich Händel", "Antonio Vivaldi", "Gioachino Rossini", "Modest Mussorgsky", "Pyotr Ilyich Tchaikovsky", "Giuseppe Verdi", "Georges Bizet"], category: "Music" },
      { prompt: "Name an explorer who discovered new lands.", answers: ["Christopher Columbus", "Vasco da Gama", "Ferdinand Magellan", "Marco Polo", "Hernán Cortés", "Francisco Pizarro", "John Smith", "James Cook", "David Livingstone", "Henry Hudson"], category: "History" },
      { prompt: "Name an NBA Hall of Famer.", answers: ["Michael Jordan", "LeBron James", "Kobe Bryant", "Magic Johnson", "Kareem Abdul-Jabbar", "Larry Bird", "Shaquille O'Neal", "Wilt Chamberlain", "Bill Russell", "Walt Frazier"], category: "Sports" },
      { prompt: "Name a famous chess player.", answers: ["Bobby Fischer", "Garry Kasparov", "Anatoly Karpov", "Magnus Carlsen", "Mikhail Tal", "Boris Spassky", "Viswanathan Anand", "José Raúl Capablanca", "Wilhelm Steinitz"], category: "Sports" },
      { prompt: "Name a Formula 1 world champion.", answers: ["Lewis Hamilton", "Michael Schumacher", "Ayrton Senna", "Juan Manuel Fangio", "Alain Prost", "Nigel Mansell", "Niki Lauda", "Jackie Stewart", "Emerson Fittipaldi", "Fernando Alonso"], category: "Sports" },
      { prompt: "Name a famous geologist or paleontologist.", answers: ["Charles Darwin", "Richard Leakey", "Donald Johanson", "Stephen Jay Gould", "Ernst Haeckel", "William Buckland", "Charles Lyell", "Alfred Wegener", "Louis Leakey"], category: "Science" },
      { prompt: "Name a famous astronomer.", answers: ["Galileo Galilei", "Nicolaus Copernicus", "Tycho Brahe", "Johannes Kepler", "Isaac Newton", "Edmond Halley", "William Herschel", "Carl Sagan", "Stephen Hawking", "Edwin Hubble"], category: "Science" },
      { prompt: "Name a World War II leader.", answers: ["Adolf Hitler", "Benito Mussolini", "Joseph Stalin", "Winston Churchill", "Franklin D. Roosevelt", "Dwight D. Eisenhower", "Harry S. Truman", "Emperor Hirohito", "Douglas MacArthur"], category: "History" },
      { prompt: "Name a Founding Father of the United States.", answers: ["George Washington", "Thomas Jefferson", "Benjamin Franklin", "James Madison", "Alexander Hamilton", "John Adams", "Samuel Adams", "Roger Sherman", "James Wilson"], category: "History" },
      { prompt: "Name a Supreme Court Justice.", answers: ["John Roberts", "Clarence Thomas", "Samuel Alito", "Elena Kagan", "Sonia Sotomayor", "Ketanji Brown Jackson", "Brett Kavanaugh", "Neil Gorsuch", "Amy Coney Barrett"], category: "History" },
      { prompt: "Name a Civil Rights activist.", answers: ["Martin Luther King Jr.", "Malcolm X", "Rosa Parks", "John Lewis", "Jesse Jackson", "Al Sharpton", "James Meredith", "Fannie Lou Hamer", "Medgar Evers"], category: "History" },
      { prompt: "Name a famous economist.", answers: ["Adam Smith", "Karl Marx", "John Maynard Keynes", "Milton Friedman", "Joseph Schumpeter", "Irving Fisher", "Paul Samuelson", "Gary Becker", "Friedrich Hayek"], category: "Science" },
      { prompt: "Name a famous philosopher.", answers: ["Socrates", "Plato", "Aristotle", "Immanuel Kant", "David Hume", "René Descartes", "Friedrich Nietzsche", "Bertrand Russell", "Ludwig Wittgenstein"], category: "Literature" },
      { prompt: "Name a Nobel Prize winner in Physics.", answers: ["Albert Einstein", "Niels Bohr", "Werner Heisenberg", "Erwin Schrödinger", "Paul Dirac", "Richard Feynman", "Enrico Fermi", "Ernest Rutherford", "Marie Curie"], category: "Science" },
      { prompt: "Name a famous movie director.", answers: ["Steven Spielberg", "Martin Scorsese", "Stanley Kubrick", "Alfred Hitchcock", "Ridley Scott", "Francis Ford Coppola", "George Lucas", "Quentin Tarantino", "Orson Welles"], category: "Entertainment" },
      { prompt: "Name an actor who won an Academy Award for Best Actor.", answers: ["Marlon Brando", "Al Pacino", "Jack Nicholson", "Tom Hanks", "Anthony Hopkins", "Daniel Day-Lewis", "Joaquin Phoenix", "Gary Oldman", "Cillian Murphy"], category: "Entertainment" },
      { prompt: "Name a Broadway performer.", answers: ["Hugh Jackman", "Kristin Chenoweth", "Lin-Manuel Miranda", "Audra McDonald", "Andrew Lloyd Webber", "Idina Menzel", "Josh Groban", "Ben Platt", "Patti LuPone"], category: "Entertainment" }
    ]
  },
  {
    label: "hard",
    prompts: [
      { prompt: "Name a Byzantine Emperor.", answers: ["Constantine the Great", "Justinian I", "Basil II", "Michael III", "Theodora", "Theodosius I", "Arcadius", "Honorius", "Leo the Isaurian"], category: "History" },
      { prompt: "Name a Japanese Shogun.", answers: ["Tokugawa Ieyasu", "Tokugawa Iyemitsu", "Tokugawa Tsunayoshi", "Toyotomi Hideyoshi", "Oda Nobunaga", "Minamoto no Yoritomo", "Takeda Shingen", "Uesugi Kenshin"], category: "History" },
      { prompt: "Name a philosopher from ancient Greece.", answers: ["Socrates", "Plato", "Aristotle", "Heraclitus", "Thales", "Pythagoras", "Zeno of Elea", "Epicurus", "Diogenes"], category: "Literature" },
      { prompt: "Name an author from the Victorian era.", answers: ["Charles Dickens", "Charlotte Brontë", "Jane Austen", "Thomas Hardy", "Oscar Wilde", "George Bernard Shaw", "Robert Louis Stevenson", "Rudyard Kipling"], category: "Literature" },
      { prompt: "Name a Russian novelist.", answers: ["Fyodor Dostoevsky", "Leo Tolstoy", "Ivan Turgenev", "Anton Chekhov", "Nikolai Gogol", "Vladimir Nabokov", "Aleksandr Solzhenitsyn", "Boris Pasternak"], category: "Literature" },
      { prompt: "Name a physicist who studied subatomic particles.", answers: ["Ernest Rutherford", "Niels Bohr", "Werner Heisenberg", "Wolfgang Pauli", "Richard Feynman", "Murray Gell-Mann", "Steven Weinberg", "Sheldon Glashow"], category: "Science" },
      { prompt: "Name a Nobel Prize winner in Chemistry.", answers: ["Marie Curie", "Linus Pauling", "Dorothy Hodgkin", "Ahmed Zewail", "Venkatraman Ramakrishnan", "Ada Yonath", "Richard Heck", "Ei-ichi Negishi"], category: "Science" },
      { prompt: "Name someone who performed at the Olympics opening ceremony.", answers: ["Lionel Richie", "Stevie Wonder", "Aretha Franklin", "Diana Ross", "The Who", "John Williams", "Paul McCartney", "Beyoncé", "Queen"], category: "Music" },
      { prompt: "Name a Pulitzer Prize winner for Fiction.", answers: ["Harper Lee", "Alice Walker", "Cormac McCarthy", "Margaret Atwood", "Colson Whitehead", "Paula Hawkins", "Anthony Doerr", "Kristin Hannah"], category: "Literature" },
      { prompt: "Name a Best Picture Oscar film.", answers: ["Parasite", "Nomadland", "CODA", "Everything Everywhere All at Once", "Oppenheimer", "The Shape of Water", "Moonlight", "Spotlight"], category: "Entertainment" },
      { prompt: "Name a Rolling Stones member.", answers: ["Mick Jagger", "Keith Richards", "Charlie Watts", "Bill Wyman", "Ronnie Wood", "Brian Jones", "Ian Stewart"], category: "Music" },
      { prompt: "Name a chess grandmaster.", answers: ["Bobby Fischer", "Garry Kasparov", "Anatoly Karpov", "Magnus Carlsen", "Viswanathan Anand", "Vladimir Kramnik", "Giri Anish", "Fabiano Caruana"], category: "Sports" },
      { prompt: "Name a Nobel Peace Prize winner.", answers: ["Barack Obama", "Malala Yousafzai", "Nelson Mandela", "Martin Luther King Jr.", "Aung San Suu Kyi", "Muhammad Yunus", "Desmond Tutu", "Elie Wiesel"], category: "History" },
      { prompt: "Name a famous conductor or maestro.", answers: ["Herbert von Karajan", "Zubin Mehta", "Georg Solti", "Claudio Abbado", "Carlo Maria Giulini", "Riccardo Muti", "Valery Gergiev", "Gustavo Dudamel"], category: "Music" },
      { prompt: "Name a Baroque composer.", answers: ["Johann Sebastian Bach", "George Frideric Handel", "Antonio Vivaldi", "Arcangelo Corelli", "Henry Purcell", "Georg Telemann", "Domenico Scarlatti"], category: "Music" },
      { prompt: "Name a contemporary installation artist.", answers: ["Ai Weiwei", "Yoko Ono", "Marina Abramović", "Jeff Koons", "Damien Hirst", "Banksy", "Christo and Jeanne-Claude"], category: "Art" },
      { prompt: "Name a Fields Medal mathematician.", answers: ["Terence Tao", "Grigory Perelman", "Andrew Wiles", "Enrico Bombieri", "David Mumford", "Alain Connes", "Pierre-Louis Lions"], category: "Science" },
      { prompt: "Name a famous political theorist.", answers: ["Thomas Hobbes", "John Locke", "Jean-Jacques Rousseau", "Edmund Burke", "Karl Marx", "John Stuart Mill", "Isaiah Berlin", "Michel Foucault"], category: "History" },
      { prompt: "Name a Renaissance humanist.", answers: ["Petrarch", "Niccolò Machiavelli", "Desiderius Erasmus", "Thomas More", "Pico della Mirandola", "Leonardo Bruni", "Lorenzo Valla"], category: "History" },
      { prompt: "Name a Film Noir director.", answers: ["Billy Wilder", "Friedrich Wilhelm Murnau", "Howard Hawks", "Robert Aldrich", "Otto Preminger", "Orson Welles", "Robert Siodmak", "John Huston"], category: "Entertainment" }
    ]
  }
];

// Game constants
const difficultyStyles = {
  easy: "Warm-up",
  medium: "Medium",
  hard: "Expert"
};

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

let score = 0;
let streak = 0;
let currentPrompt = null;
let usedPromptIndexes = { easy: [], medium: [], hard: [] };
let promptRound = 0;
let wrongGuesses = 0;
let isGameOver = false;
let isSelecting = false;

function getCurrentDifficultyTier() {
  return Math.min(Math.floor(promptRound / 4), difficultyLevels.length - 1);
}

function getRandomPrompt() {
  const tierIndex = getCurrentDifficultyTier();
  const selectedTier = difficultyLevels[tierIndex];
  const used = usedPromptIndexes[selectedTier.label] || [];
  const available = selectedTier.prompts
    .map((item, index) => ({ item, index }))
    .filter(({ index }) => !used.includes(index));

  if (available.length === 0) {
    usedPromptIndexes[selectedTier.label] = [];
    return getRandomPrompt();
  }

  const randomEntry = available[Math.floor(Math.random() * available.length)];
  usedPromptIndexes[selectedTier.label].push(randomEntry.index);
  return { ...randomEntry.item, tier: selectedTier.label };
}

function updateDifficultyBadge() {
  const difficulty = currentPrompt?.tier || "easy";
  difficultyBadgeEl.textContent = difficultyStyles[difficulty] || "Warm-up";
  difficultyBadgeEl.className = `difficulty-badge ${difficulty}`;
}

function hideSuggestions() {
  suggestionListEl.classList.remove("visible");
  suggestionListEl.innerHTML = "";
}

const allAutocompleteNames = [
  ...new Set(
    difficultyLevels.flatMap((tier) =>
      tier.prompts
        .flatMap((prompt) => prompt.answers)
        .filter((name) => isFullNameAnswer(name))
    )
  )
];

function renderSuggestions() {
  if (isGameOver || isSelecting) return;

  const inputValue = normalizeAnswer(answerInputEl.value);
  if (!inputValue) {
    hideSuggestions();
    return;
  }

  const matches = allAutocompleteNames
    .map((name) => ({ value: name, normalized: normalizeAnswer(name) }))
    .filter(({ normalized }) => normalized.includes(inputValue))
    .slice(0, 12);

  if (!matches.length) {
    hideSuggestions();
    return;
  }

  suggestionListEl.innerHTML = matches
    .map(({ value }) => `
      <button class="suggestion-item" type="button" data-value="${value}">
        ${value}
      </button>
    `)
    .join("");

  suggestionListEl.classList.add("visible");
}

function selectSuggestion(value) {
  if (!value) return;
  isSelecting = true;
  answerInputEl.value = value;
  hideSuggestions();
  answerInputEl.focus();
  setTimeout(() => {
    isSelecting = false;
  }, 100);
}

function updateLivesDisplay() {
  livesLeftEl.textContent = String(Math.max(0, 3 - wrongGuesses));
}

function focusSuggestion(direction) {
  const items = Array.from(document.querySelectorAll(".suggestion-item"));
  if (!items.length) return;

  const current = document.activeElement;
  let nextIndex = 0;

  if (current && items.includes(current)) {
    nextIndex = items.indexOf(current) + direction;
  } else {
    nextIndex = direction > 0 ? 0 : items.length - 1;
  }

  if (nextIndex < 0 || nextIndex >= items.length) {
    answerInputEl.focus();
  } else {
    items[nextIndex].focus();
  }
}

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (isGameOver) return;

  const userAnswer = answerInputEl.value.trim();

  if (!userAnswer) {
    feedbackEl.textContent = "Please enter an answer!";
    feedbackEl.className = "feedback incorrect";
    return;
  }

  if (!isFullNameAnswer(userAnswer)) {
    feedbackEl.textContent = "Please enter a full name!";
    feedbackEl.className = "feedback incorrect";
    return;
  }

  const validAnswers = getValidPromptAnswers(currentPrompt);
  const isCorrect = validAnswers.some(
    (answer) => normalizeAnswer(answer) === normalizeAnswer(userAnswer)
  );

  if (isCorrect) {
    score += 10 + streak * 2;
    streak++;
    scoreEl.textContent = String(score);
    streakEl.textContent = String(streak);
    feedbackEl.textContent = "Correct!";
    feedbackEl.className = "feedback correct";
  } else {
    streak = 0;
    streakEl.textContent = "0";
    feedbackEl.textContent = "Incorrect!";
    feedbackEl.className = "feedback incorrect";
    wrongGuesses++;
    if (wrongGuesses >= 3) {
      isGameOver = true;
      answerForm.style.display = "none";
      feedbackEl.textContent = `Game Over! Final Score: ${score}`;
      feedbackEl.className = "feedback gameover";
      return;
    }
  }

  updateLivesDisplay();
  setTimeout(() => {
    if (!isGameOver) {
      promptRound++;
      currentPrompt = getRandomPrompt();
      if (currentPrompt) {
        promptTextEl.textContent = currentPrompt.prompt;
      }
      answerInputEl.value = "";
      hideSuggestions();
      updateDifficultyBadge();
      feedbackEl.textContent = "";
    }
  }, 1400);
});

skipBtn.addEventListener("click", () => {
  if (isGameOver) return;

  const validAnswers = getValidPromptAnswers(currentPrompt);
  feedbackEl.textContent = `Correct answer: ${validAnswers[0] || "Unknown"}`;
  feedbackEl.className = "feedback reveal";
  streak = 0;
  streakEl.textContent = "0";
  wrongGuesses++;
  updateLivesDisplay();

  if (wrongGuesses >= 3) {
    isGameOver = true;
    answerForm.style.display = "none";
    feedbackEl.textContent = `Game Over! Final Score: ${score}`;
    feedbackEl.className = "feedback gameover";
    return;
  }

  setTimeout(() => {
    if (!isGameOver) {
      promptRound++;
      currentPrompt = getRandomPrompt();
      if (currentPrompt) {
        promptTextEl.textContent = currentPrompt.prompt;
      }
      answerInputEl.value = "";
      hideSuggestions();
      updateDifficultyBadge();
      feedbackEl.textContent = "";
    }
  }, 1400);
});

newGameBtn.addEventListener("click", () => {
  score = 0;
  streak = 0;
  promptRound = 0;
  wrongGuesses = 0;
  isGameOver = false;
  usedPromptIndexes = { easy: [], medium: [], hard: [] };

  scoreEl.textContent = "0";
  streakEl.textContent = "0";
  updateLivesDisplay();
  answerForm.style.display = "flex";
  answerInputEl.value = "";
  hideSuggestions();
  feedbackEl.textContent = "";

  currentPrompt = getRandomPrompt();
  if (currentPrompt) {
    promptTextEl.textContent = currentPrompt.prompt;
  }
  updateDifficultyBadge();
  answerInputEl.focus();
});

answerInputEl.addEventListener("input", renderSuggestions);
answerInputEl.addEventListener("focus", renderSuggestions);

answerInputEl.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    focusSuggestion(1);
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    focusSuggestion(-1);
    return;
  }
});

let touchStartY = 0;
let touchStartX = 0;
let touchMoved = false;

suggestionListEl.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.touches[0];
    touchStartY = touch.clientY;
    touchStartX = touch.clientX;
    touchMoved = false;
  },
  { passive: true }
);

suggestionListEl.addEventListener(
  "touchmove",
  (event) => {
    const touch = event.touches[0];
    if (
      Math.abs(touch.clientY - touchStartY) > 10 ||
      Math.abs(touch.clientX - touchStartX) > 10
    ) {
      touchMoved = true;
    }
  },
  { passive: true }
);

suggestionListEl.addEventListener("touchend", (event) => {
  if (touchMoved) return;
  const item = event.target.closest(".suggestion-item");
  if (!item) return;
  event.preventDefault();
  selectSuggestion(item.dataset.value);
});

suggestionListEl.addEventListener("mousedown", (event) => {
  // Prevent answerInputEl from blurring and triggering soft keyboard layout jumps
  event.preventDefault();
});

suggestionListEl.addEventListener("click", (event) => {
  const item = event.target.closest(".suggestion-item");
  if (!item) return;
  selectSuggestion(item.dataset.value);
});

suggestionListEl.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    focusSuggestion(1);
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    focusSuggestion(-1);
    return;
  }

  if (event.key === "Enter" || event.key === " ") {
    const activeItem = document.activeElement;
    if (activeItem && activeItem.classList.contains("suggestion-item")) {
      event.preventDefault();
      selectSuggestion(activeItem.dataset.value);
    }
    return;
  }

  if (event.key === "Escape") {
    hideSuggestions();
    answerInputEl.focus();
  }
});

document.addEventListener("pointerdown", (event) => {
  if (
    !answerInputEl.contains(event.target) &&
    !suggestionListEl.contains(event.target)
  ) {
    hideSuggestions();
  }
});

// Initialize game
score = 0;
streak = 0;
promptRound = 0;
wrongGuesses = 0;
isGameOver = false;
scoreEl.textContent = "0";
streakEl.textContent = "0";
currentPrompt = getRandomPrompt();
if (currentPrompt) {
  promptTextEl.textContent = currentPrompt.prompt;
}
updateDifficultyBadge();
updateLivesDisplay();
