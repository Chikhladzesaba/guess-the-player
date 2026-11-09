// Guess the Player — game logic
const MAX_TRIES = 8;
const STORE_KEY = "guessplayer:state";   // our own key only — never localStorage.clear()
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
const n = PLAYERS.length;
const answer = practice
  ? PLAYERS[Math.floor(Math.random() * n)]
  : PLAYERS[((dayNumber() % n) + n) % n];

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
function age(p) { return new Date().getFullYear() - p.born; }

function compare(g) {
  const a = answer;
  const ageDiff = age(a) - age(g);
  return [
    { label: "Nation", value: g.nation,
      status: g.nation === a.nation ? "match" : g.continent === a.continent ? "close" : "" },
    { label: "League", value: g.league, status: g.league === a.league ? "match" : "" },
    { label: "Club", value: g.club, status: g.club === a.club ? "match" : "" },
    { label: "Pos", value: g.position, status: g.position === a.position ? "match" : "" },
    { label: "Age", value: age(g) + (ageDiff > 0 ? " ⬆️" : ageDiff < 0 ? " ⬇️" : ""),
      status: ageDiff === 0 ? "match" : Math.abs(ageDiff) <= 2 ? "close" : "" }
  ];
}

function findPlayer(name) {
  const clean = name.trim().toLowerCase();
  return PLAYERS.find(p => p.name.toLowerCase() === clean);
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

// fill the suggestion list
PLAYERS.forEach(p => {
  const o = document.createElement("option");
  o.value = p.name;
  list.append(o);
});

render();
