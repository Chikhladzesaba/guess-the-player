// Guess the Player — game logic
const MAX_TRIES = 8;
const STORE_KEY = "guessplayer:v2";      // our own key only — never localStorage.clear()
const START = new Date(2026, 10, 10);    // day 0 = 10 Nov 2026 (months start at 0)

// ?practice in the address = random player, nothing saved (for testing)
const practice = new URLSearchParams(location.search).has("practice");

const form = document.getElementById("guess-form");
const input = document.getElementById("guess-input");
const list = document.getElementById("player-list");
const board = document.getElementById("board");
const message = document.getElementById("message");
const triesText = document.getElementById("tries");

// ---------- Today's answer ----------
function todayKey() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function dayNumber() {
  const d = new Date();
  const today = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((today - START) / 86400000);
}
// ANSWERS (in players.js) = the players who can be the mystery player, in daily order
const n = ANSWERS.length;
const answerName = practice
  ? ANSWERS[Math.floor(Math.random() * n)]
  : ANSWERS[((dayNumber() % n) + n) % n];
const answer = PLAYERS.find(p => p.name === answerName);

// ---------- Saved progress ----------
function loadState() {
  if (practice) return null;
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && s.date === todayKey()) return s;
  } catch (e) {}
  return null;
}
function saveState() {
  if (practice) return;
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
}
let state = loadState() || { date: todayKey(), guesses: [], done: null };

// ---------- Comparing a guess with the answer ----------
// exact age from birth date ("2001-09-05")
function age(p) {
  const today = new Date();
  const [y, m, d] = p.born.split("-").map(Number);
  let years = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) years--;
  return years;
}

// a number tile: green if equal, yellow if within `near`, arrow = is the answer higher or lower?
function numberTile(label, guessValue, answerValue, near) {
  const diff = answerValue - guessValue;
  return {
    label,
    value: guessValue + (diff > 0 ? " ⬆️" : diff < 0 ? " ⬇️" : ""),
    status: diff === 0 ? "match" : Math.abs(diff) <= near ? "close" : ""
  };
}

function compare(g) {
  const a = answer;
  return [
    { label: "Nation", value: g.nation,
      status: g.nation === a.nation ? "match" : g.continent === a.continent ? "close" : "" },
    { label: "Club", value: g.club, status: g.club === a.club ? "match" : "" },
    { label: "Pos", value: g.position, status: g.position === a.position ? "match" : "" },
    numberTile("Age", age(g), age(a), 2),
    numberTile("Joined", g.joined, a.joined, 1)
  ];
}

// "Odegaard" finds "Martin Ødegaard": ignore case and accents
function simplify(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/ø/gi, "o").replace(/đ/gi, "d").replace(/ß/g, "ss").toLowerCase().trim();
}
function findPlayer(name) {
  const clean = simplify(name);
  return PLAYERS.find(p => simplify(p.name) === clean);
}

// ---------- Drawing the page ----------
function render() {
  board.innerHTML = "";
  // newest guess on top
  state.guesses.slice().reverse().forEach(name => {
    const p = findPlayer(name);
    if (!p) return;
    const card = document.createElement("div");
    card.className = "guess";
    const title = document.createElement("div");
    title.className = "guess-name";
    title.textContent = p.name;
    const tiles = document.createElement("div");
    tiles.className = "tiles";
    compare(p).forEach(t => {
      const tile = document.createElement("div");
      tile.className = "tile " + t.status;
      const small = document.createElement("small");
      small.textContent = t.label;
      tile.append(small, t.value);
      tiles.append(tile);
    });
    card.append(title, tiles);
    board.append(card);
  });

  const used = state.guesses.length;
  triesText.textContent = used + " / " + MAX_TRIES + " tries" + (practice ? " · practice mode" : "");

  if (state.done) {
    input.disabled = true;
    form.querySelector("button").disabled = true;
    message.textContent = state.done === "won"
      ? "You got it in " + used + "! It was " + answer.name + "."
      : "Out of tries. The answer was " + answer.name + ".";
    if (practice) {
      const again = document.createElement("a");
      again.href = "?practice";
      again.textContent = " Play again";
      message.append(again);
    } else {
      message.append(" New player tomorrow.");
    }
  }
}

// ---------- Handling a guess ----------
form.addEventListener("submit", e => {
  e.preventDefault();
  if (state.done) return;
  const p = findPlayer(input.value);
  if (!p) { message.textContent = "Pick a name from the list."; return; }
  if (state.guesses.includes(p.name)) { message.textContent = "You already tried " + p.name + "."; return; }

  message.textContent = "";
  state.guesses.push(p.name);
  if (p.name === answer.name) state.done = "won";
  else if (state.guesses.length >= MAX_TRIES) state.done = "lost";
  saveState();
  input.value = "";
  render();
});

// "How to play": open automatically on someone's first visit only
try {
  if (!localStorage.getItem("guessplayer:seenHelp")) {
    document.getElementById("how-to").open = true;
    localStorage.setItem("guessplayer:seenHelp", "1");
  }
} catch (e) {}

// fill the suggestion list
PLAYERS.forEach(p => {
  const o = document.createElement("option");
  o.value = p.name;
  list.append(o);
});

render();
