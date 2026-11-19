// JustUs — a game for two. Two phones, one room code.
// Sync: a tiny room row in a Supabase table, polled over plain HTTPS —
// works on every network. State is synced wholesale with a sequence number.
const $ = (id) => document.getElementById(id);
const SSKEY = "justus_session_v5";
const SB_URL = "https://tucqsqkaougrxiwcsjdz.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1Y3FzcWthb3Vncnhpd2NzamR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0ODc0NjQsImV4cCI6MjExMDA2MzQ2NH0.G-drpDREJ4BjRhNc-sEk89iN0EAkpr4tPI5vRkKKJrw";
const ROOMS = SB_URL + "/rest/v1/justus_rooms";
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const POLL_MS = 1500;
const ROOM_TTL_MS = 30 * 60 * 1000;

// ---------------- content ----------------
const QUIZ = [
  { topic: "favourite comfort food", options: ["Jollof rice & chicken", "Pizza", "Burger & fries", "Ice cream"] },
  { topic: "dream holiday", options: ["Beach resort", "City adventure", "Quiet cabin in nature", "Luxury hotel & spa"] },
  { topic: "biggest pet peeve", options: ["Being ignored", "People being late", "Messiness", "Being interrupted"] },
  { topic: "favourite way to relax", options: ["Music", "Movies & series", "Sleeping in", "Talking with you"] },
  { topic: "hidden talent", options: ["Singing", "Dancing", "Cooking", "Making people laugh"] },
  { topic: "favourite type of movie", options: ["Action", "Romance", "Comedy", "Horror"] },
  { topic: "sleep style", options: ["Early bird", "Night owl", "Sleeps anywhere, anytime", "Light sleeper"] },
  { topic: "childhood dream job", options: ["Doctor", "Pilot", "Footballer", "Music star"] },
  { topic: "biggest fear", options: ["Heights", "Snakes", "Failure", "Losing loved ones"] },
  { topic: "favourite thing about your partner", options: ["Their smile", "Their kindness", "Their ambition", "Their sense of humour"] },
  { topic: "ideal date night", options: ["Dinner out", "Movie night in", "Long drive & music", "Dancing together"] },
  { topic: "phone habit", options: ["Always on it", "Checks it now and then", "Mostly on silent", "Forgets it everywhere"] },
  { topic: "favourite gift to receive", options: ["Perfume", "Clothes or shoes", "A new gadget", "Quality time together"] },
  { topic: "guilty pleasure", options: ["Reality TV", "Midnight snacks", "Celebrity gossip", "Online shopping"] },
  { topic: "most important quality in a partner", options: ["Loyalty", "Honesty", "Ambition", "Affection"] },
  { topic: "favourite music vibe", options: ["Afrobeats", "R&B slow jams", "Gospel", "Hip-hop & rap"] },
  { topic: "the thing they can never resist", options: ["Good food", "A great bargain", "Your cooking", "A new phone"] },
  { topic: "how they handle stress", options: ["Goes quiet", "Talks it out", "Music & alone time", "Eats something sweet"] },
  { topic: "dream ride", options: ["Sleek sports car", "Big luxury SUV", "Classic vintage car", "Forget cars — private jet"] },
  { topic: "favourite way to spend a Sunday", options: ["Church & family", "Resting at home", "Out with friends", "Adventure somewhere new"] },
];

const TRUTHS = {
  1: [
    "What was the first thing you noticed about your partner?",
    "Describe your favourite memory together so far.",
    "What small thing does your partner do that always makes you smile?",
    "When did you first realise you liked your partner?",
    "Which song reminds you of your partner, and why?",
    "What is one thing your partner does better than anyone you know?",
    "Describe your perfect lazy day together.",
    "What compliment from your partner do you still think about?",
    "Where would you love to travel together first?",
    "What is your favourite nickname for your partner?",
  ],
  2: [
    "What is one thing you have never told your partner before?",
    "What do you need more of in this relationship?",
    "What is your biggest fear about the future?",
    "When do you feel closest to your partner?",
    "What does your partner do that makes you feel truly loved?",
    "What is one dream you have not said out loud yet?",
    "When was the last time you cried, and why?",
    "What is one thing you want to work on in yourself, for this relationship?",
    "What does 'forever' look like to you?",
    "What is one question you have always wanted to ask your partner?",
  ],
  3: [
    "What is the most attractive thing your partner does without realising it?",
    "Describe your partner's best kiss in three words.",
    "What outfit of your partner's drives you wild?",
    "What is one fantasy you have never shared with anyone?",
    "Rate your partner's kisses from 1 to 10 — and defend your score.",
    "What do you find hardest to resist about your partner?",
    "Slow and romantic, or wild and spontaneous — which night do you prefer?",
    "What is the boldest thing you have ever done for love?",
    "Say out loud the thing you want your partner to do tonight.",
    "Where is the most daring place you would want to steal a kiss?",
  ],
};

const DARES = {
  1: [
    "Give your partner a 30-second hug — no letting go early.",
    "Look into your partner's eyes for one full minute without laughing.",
    "Feed your partner a snack, bite by bite.",
    "Slow-dance together to one full song.",
    "Trace a love note on your partner's palm with your finger.",
    "Massage your partner's shoulders for two minutes.",
    "Give three genuine compliments, back to back.",
    "Hold hands until your next turn comes around.",
    "Draw a heart somewhere on your partner's arm.",
    "Whisper something sweet in your partner's ear.",
  ],
  2: [
    "Sing a love song to your partner — full chorus, no shame.",
    "Act out your first meeting together — play both roles.",
    "Let your partner style your hair however they like.",
    "Do your best catwalk walk for your partner.",
    "Speak only in a romantic accent until your next turn.",
    "Make your partner laugh within 30 seconds — no touching allowed.",
    "Serenade your partner using a spoon as a microphone.",
    "Let your partner draw a tiny pen tattoo on you.",
    "Recreate a famous movie romance scene together.",
    "Feed your partner something with your eyes closed — no spills!",
  ],
  3: [
    "Give your partner a kiss that lasts at least 30 seconds.",
    "Blindfold your partner and feed them something sweet — they must guess what it is.",
    "Whisper in your partner's ear exactly what you want later tonight.",
    "Give your partner a slow back massage for three minutes.",
    "Kiss your partner's favourite spot — you know the one.",
    "Dance for your partner — one song, your very best moves.",
    "Let your partner choose where your next kiss lands.",
    "Hold your partner close and describe, slowly, what you want.",
    "Kiss your partner's hand like royalty — then don't stop at the hand.",
    "Your partner picks any dare from this level for you — no refusing.",
  ],
};

// ---------------- state ----------------
let me = null;            // 'host' | 'guest'
let roomCode = "";
let myDisplayName = "";
let S = null;             // shared state (synced wholesale)
let pollTimer = null, heartbeatTimer = null;
let roomSeen = false;
let blocked = false;
let writeInFlight = false, writeDirty = false;
let netErrors = 0;
// A persistent per-browser identity: this is how the app knows you are the
// host (or the guest) when you come back, even after the browser was closed.
let myUid = null;
try { myUid = localStorage.getItem("justus_uid"); } catch (e) {}
if (!myUid) {
  myUid = "u" + Math.random().toString(36).slice(2, 12);
  try { localStorage.setItem("justus_uid", myUid); } catch (e) {}
}

function freshState(myName) {
  return {
    screen: "lobby",
    players: { host: { name: myName, score: 0, uid: myUid }, guest: null },
    sparks: 0,
    quiz: null,
    td: null,
    _seq: 0,
    _by: myUid,
  };
}
const other = (r) => (r === "host" ? "guest" : "host");
const pname = (r) => (S.players[r] ? S.players[r].name : "your partner");
const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);

// ---------------- session persistence ----------------
function saveSession() {
  if (!me || !roomCode) return;
  try { localStorage.setItem(SSKEY, JSON.stringify({ me, roomCode, name: myDisplayName, S })); } catch (e) {}
}
function clearSession() { try { localStorage.removeItem(SSKEY); } catch (e) {} }

// ---------------- banner ----------------
function showBanner(text) {
  let d = document.getElementById("connBanner");
  if (!d) {
    d = document.createElement("div");
    d.id = "connBanner";
    d.style.cssText = "position:fixed;left:12px;right:12px;bottom:12px;z-index:50;background:#2B1030;color:#fff;border-radius:14px;padding:13px 16px;font-size:14px;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,.3);text-align:center";
    document.body.appendChild(d);
  }
  d.textContent = text;
  d.style.display = "block";
}
function hideBanner() {
  const d = document.getElementById("connBanner");
  if (d) d.style.display = "none";
}

// ---------------- backend sync ----------------
function api(path, opts) {
  opts = opts || {};
  const headers = Object.assign({
    apikey: SB_KEY,
    Authorization: "Bearer " + SB_KEY,
    "Content-Type": "application/json",
  }, opts.headers || {});
  return fetch(ROOMS + path, Object.assign({}, opts, { headers }));
}

async function writeState() {
  if (writeInFlight) { writeDirty = true; return; }
  writeInFlight = true;
  try {
    await api("?code=eq." + encodeURIComponent(roomCode), {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ state: S, updated_at: new Date().toISOString() }),
    });
    netErrors = 0;
    hideBanner();
  } catch (e) {
    netErrors++;
    if (netErrors >= 2) showBanner("💔 Connection interrupted — retrying… don't close the page.");
  }
  writeInFlight = false;
  if (writeDirty) { writeDirty = false; writeState(); }
}

function mutate(fn) {
  fn();
  S._seq = (S._seq || 0) + 1;
  S._by = myUid;
  writeState();
  render();
}

async function pollOnce() {
  if (!roomCode) return;
  let rows;
  try {
    const res = await api("?code=eq." + encodeURIComponent(roomCode) + "&select=state,updated_at");
    rows = await res.json();
    netErrors = 0;
    hideBanner();
  } catch (e) {
    netErrors++;
    if (netErrors >= 2) showBanner("💔 Connection interrupted — retrying… don't close the page.");
    return;
  }
  if (!rows || !rows.length) {
    if (roomSeen) roomClosed();
    return;
  }
  const row = rows[0];
  if (!roomSeen) {
    roomSeen = true;
    if (Date.now() - new Date(row.updated_at).getTime() > ROOM_TTL_MS && me === "guest" && !S) {
      setHomeStatus("That room has expired — ask your partner to create a fresh one.");
      stopLoops();
      return;
    }
  }
  const incoming = row.state;
  if (!incoming) return;
  let adopted = false;
  if (!S) { S = incoming; adopted = true; }
  else if ((incoming._seq || 0) > (S._seq || 0)) { S = incoming; adopted = true; }
  if (adopted) {
    // A third browser (both seats taken by other people) may not sneak in.
    if (S.players.host && S.players.host.uid !== myUid && S.players.guest && S.players.guest.uid !== myUid) {
      blocked = true;
      stopLoops();
      clearSession();
      S = null;
      roomSeen = false;
      render();
      setHomeStatus("That room already has two players — create your own room instead.");
      return;
    }
    afterAdopt();
    render();
  }
}

// Your seat in the room comes from your browser identity, not from which
// button you tapped — rejoining with the code still makes the host the host.
function resolveRole() {
  if (!S) return;
  if (S.players.host && S.players.host.uid === myUid) me = "host";
  else if (S.players.guest && S.players.guest.uid === myUid) me = "guest";
}

// After adopting a state (mainly: a guest claims the empty guest slot)
function afterAdopt() {
  resolveRole();
  if (me === "guest" && S && !S.players.guest) {
    S.players.guest = { name: myDisplayName, score: 0, uid: myUid };
    S._seq = (S._seq || 0) + 1;
    S._by = myUid;
    writeState();
  }
}

function roomClosed() {
  stopLoops();
  clearSession();
  S = null;
  roomSeen = false;
  hideBanner();
  render();
  setHomeStatus("The room was closed by your partner.");
}

function startLoops() {
  stopLoops();
  pollTimer = setInterval(pollOnce, POLL_MS);
  heartbeatTimer = setInterval(() => {
    if (me !== "host" || !roomCode) return;
    api("?code=eq." + encodeURIComponent(roomCode), {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ updated_at: new Date().toISOString() }),
    }).catch(() => {});
  }, 25000);
}
function stopLoops() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
}

// ---------------- home actions ----------------
function makeCode() {
  let c = "";
  for (let i = 0; i < 5; i++) c += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return c;
}
function updateRoomPill() {
  if (roomCode) { $("roomCodeLabel").textContent = roomCode; $("roomPill").classList.remove("hidden"); }
}
function myName() { return $("nameInput").value.trim(); }

$("createBtn").addEventListener("click", async () => {
  const name = myName();
  if (!name) { setHomeStatus("Type your name first 💞"); return; }
  me = "host";
  myDisplayName = name;
  blocked = false;
  setHomeStatus("Creating your room…");
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = makeCode();
    const st = freshState(name);
    try {
      const res = await api("", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ code, state: st }),
      });
      if (res.status === 409) continue;           // code already taken — try another
      if (!res.ok) throw new Error("create failed");
      roomCode = code;
      S = st;
      roomSeen = true;
      clearSession();
      updateRoomPill();
      setHomeStatus("");
      startLoops();
      render();
      return;
    } catch (e) {
      setHomeStatus("Could not create the room — check your internet and try again.");
      return;
    }
  }
  setHomeStatus("Could not create the room — try once more.");
});

$("joinBtn").addEventListener("click", () => {
  const name = myName();
  const code = $("codeInput").value.trim().toUpperCase();
  if (!name) { setHomeStatus("Type your name first 💞"); return; }
  if (code.length !== 5) { setHomeStatus("Enter the 5-letter room code."); return; }
  me = "guest";
  myDisplayName = name;
  roomCode = code;
  roomSeen = false;
  blocked = false;
  S = null;
  clearSession();
  saveSession();
  updateRoomPill();
  setHomeStatus("Joining room " + code + "…");
  startLoops();
  pollOnce();
  setTimeout(() => {
    if (!S && !roomSeen && !blocked) { stopLoops(); setHomeStatus("Room not found — check the code, and make sure your partner created the room first."); }
  }, 9000);
});

async function leaveRoom() {
  stopLoops();
  try {
    if (me === "host") {
      await api("?code=eq." + encodeURIComponent(roomCode), { method: "DELETE" });
    } else if (S && S.players.guest && S.players.guest.uid === myUid) {
      S.players.guest = null;
      S._seq = (S._seq || 0) + 1;
      await api("?code=eq." + encodeURIComponent(roomCode), {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ state: S, updated_at: new Date().toISOString() }),
      });
    }
  } catch (e) {}
  clearSession();
  location.reload();
}
$("leaveBtn").addEventListener("click", leaveRoom);
$("leaveBtn2").addEventListener("click", leaveRoom);

function setHomeStatus(t, ok) {
  const el = $("homeStatus");
  el.textContent = t;
  el.className = "status" + (ok ? " ok" : "");
}

// ---------------- rendering ----------------
function show(id) {
  for (const s of ["scr-home", "scr-lobby", "scr-menu", "scr-quiz", "scr-td"]) $(s).classList.toggle("hidden", s !== id);
}

function render() {
  saveSession();
  if (!S) { show("scr-home"); return; }
  if (S.screen === "lobby") { show("scr-lobby"); renderLobby(); }
  else if (S.screen === "menu") { show("scr-menu"); renderMenu(); }
  else if (S.screen === "quiz") { show("scr-quiz"); renderQuiz(); }
  else if (S.screen === "td") { show("scr-td"); renderTd(); }
}

function renderLobby() {
  $("lobbyCode").textContent = roomCode || "·····";
  $("chipHost").querySelector("span").textContent = S.players.host.name;
  const g = S.players.guest;
  $("chipGuest").querySelector("span").textContent = g ? g.name : "waiting…";
  $("chipGuest").classList.toggle("waiting", !g);
  const canStart = me === "host" && !!g;
  $("startBtn").classList.toggle("hidden", !canStart);
  $("lobbyHint").innerHTML = g
    ? `<b>${g.name}</b> is here! 💞` + (me === "host" ? " Tap start when you're ready." : " Waiting for " + S.players.host.name + " to start…")
    : "Tell your partner to open this same page, type their name, enter this code and tap <b>Join room</b>.";
}

$("startBtn").addEventListener("click", () => mutate(() => { S.screen = "menu"; }));

function scoreBarHtml() {
  const h = S.players.host, g = S.players.guest;
  return `<span class="score-chip">💞 ${h.name}: <b>${h.score}</b></span>` +
    (g ? `<span class="score-chip">💞 ${g.name}: <b>${g.score}</b></span>` : "") +
    `<span class="score-chip">🔥 Sparks: <b>${S.sparks}</b></span>`;
}

function renderMenu() {
  $("menuSub").textContent = S.players.guest
    ? `${S.players.host.name} & ${S.players.guest.name} — pick a game`
    : "Pick a game";
  $("scoreBar").innerHTML = scoreBarHtml();
}

// ---------------- quiz ----------------
$("playQuizBtn").addEventListener("click", () => mutate(() => {
  const picks = shuffle(QUIZ.map((_, i) => i)).slice(0, 10);
  S.quiz = {
    setter: "host", round: 1, step: 0, phase: "set",
    questions: picks, answers: {}, guesses: {},
    roundScores: { host: 0, guest: 0 },
  };
  S.screen = "quiz";
}));

function quizRoles() {
  const q = S.quiz;
  return { setter: q.setter, guesser: other(q.setter) };
}

function renderQuiz() {
  const q = S.quiz;
  const { setter, guesser } = quizRoles();
  $("quizPhase").textContent = q.phase === "results" ? "Quiz — results" : `Quiz · Round ${q.round}`;
  $("quizProgress").textContent = q.phase === "set" || q.phase === "guess" ? `Question ${Math.min(q.step + 1, 5)} of 5` : "";
  const card = $("quizCard");

  if (q.phase === "results") {
    const total = q.roundScores.host + q.roundScores.guest;
    const pct = Math.round((total / 10) * 100);
    const verdict = pct >= 90 ? "Soulmate level. You two could finish each other's sentences — and probably do. 💞"
      : pct >= 70 ? "Deeply connected. You know the big things and most of the small ones too."
      : pct >= 50 ? "Growing strong — a few surprises tonight, and that's a good thing."
      : "Plenty to discover — lucky for you, discovering each other is the fun part. Keep talking. 💬";
    card.innerHTML = `
      <p class="q-sub center">Your connection score</p>
      <div class="big-score">${pct}%</div>
      <p class="verdict">${verdict}</p>
      <p class="center"><b>${pname("host")}</b> guessed ${q.roundScores.host}/5 · <b>${pname("guest")}</b> guessed ${q.roundScores.guest}/5</p>
      <button class="btn btn-grad btn-block" id="qAgain">Play again</button>
      <button class="btn btn-light btn-block mt" id="qMenu">Back to games</button>`;
    $("qAgain").addEventListener("click", () => $("playQuizBtn").click());
    $("qMenu").addEventListener("click", () => mutate(() => { S.screen = "menu"; S.quiz = null; }));
    return;
  }

  if (q.phase === "reveal") {
    const rows = q.questions.slice((q.round - 1) * 5, q.round * 5).map((qi) => {
      const item = QUIZ[qi];
      const a = q.answers[qi], g = q.guesses[qi];
      const right = a === g;
      return `<div class="reveal-row"><span class="t">${item.topic}</span><span>${right ? "✅" : "❌"} ${item.options[g]}</span></div>
              <div class="reveal-row"><span></span><span style="color:var(--muted)">${pname(setter)}'s answer: ${item.options[a]}</span></div>`;
    }).join("");
    const correct = q.roundScores[guesser];
    card.innerHTML = `
      <h3 class="q-topic">${pname(guesser)} got ${correct} of 5 💞</h3>
      <p class="q-sub">How well ${pname(guesser)} knows ${pname(setter)}:</p>
      ${rows}
      <button class="btn btn-grad btn-block mt" id="qNext">${q.round === 1 ? `Swap — ${pname(guesser)} sets the questions` : "See our results →"}</button>`;
    $("qNext").addEventListener("click", () => mutate(() => {
      if (q.round === 1) {
        q.round = 2; q.setter = guesser; q.step = 0; q.phase = "set"; q.answers = {}; q.guesses = {};
      } else { q.phase = "results"; }
    }));
    return;
  }

  // set / guess phases
  const qi = q.questions[(q.round - 1) * 5 + q.step];
  const item = QUIZ[qi];
  const acting = q.phase === "set" ? setter : guesser;
  if (me !== acting) {
    card.innerHTML = `<div class="waiting-box"><div class="big">${q.phase === "set" ? "🤫" : "🤔"}</div>
      <p class="q-topic">${q.phase === "set" ? `${pname(setter)} is answering about themselves…` : `${pname(guesser)} is guessing your answers…`}</p>
      <p class="q-sub">Question ${q.step + 1} of 5 — no peeking, no hints!</p></div>`;
    return;
  }
  const title = q.phase === "set"
    ? `About you: ${item.topic}`
    : `What is ${pname(setter)}'s ${item.topic}?`;
  const sub = q.phase === "set"
    ? "Pick the true answer about yourself. Your partner will have to guess it."
    : `Guess what ${pname(setter)} picked. No asking!`;
  card.innerHTML = `<h3 class="q-topic">${title}</h3><p class="q-sub">${sub}</p>` +
    item.options.map((op, i) => `<button class="opt" data-opt="${i}">${op}</button>`).join("");
  card.querySelectorAll(".opt").forEach((b) => b.addEventListener("click", () => {
    const val = Number(b.dataset.opt);
    mutate(() => {
      if (q.phase === "set") q.answers[qi] = val; else q.guesses[qi] = val;
      q.step++;
      if (q.step >= 5) {
        if (q.phase === "set") { q.phase = "guess"; q.step = 0; }
        else {
          let correct = 0;
          for (const k of Object.keys(q.answers)) if (q.guesses[k] === q.answers[k]) correct++;
          q.roundScores[guesser] = correct;
          S.players[guesser].score += correct;
          q.phase = "reveal";
        }
      }
    });
  }));
}

// ---------------- truth or dare ----------------
$("playTdBtn").addEventListener("click", () => mutate(() => {
  if (!S.td) S.td = { turn: "host", heat: 1, card: null, used: [] };
  S.screen = "td";
}));
$("tdMenuBtn").addEventListener("click", () => mutate(() => { S.screen = "menu"; }));

document.querySelectorAll("[data-heat]").forEach((b) => b.addEventListener("click", () => {
  mutate(() => { S.td.heat = Number(b.dataset.heat); });
}));

function drawCard(type, heat) {
  const deck = (type === "truth" ? TRUTHS : DARES)[heat];
  const fresh = deck.filter((t) => !S.td.used.includes(type + ":" + t));
  const pool = fresh.length ? fresh : deck;
  const text = pool[Math.floor(Math.random() * pool.length)];
  S.td.used.push(type + ":" + text);
  return { type, text, forId: S.td.turn };
}

function renderTd() {
  const td = S.td;
  $("tdSparks").textContent = "🔥 " + S.sparks + " sparks";
  document.querySelectorAll("[data-heat]").forEach((b) => b.classList.toggle("active", Number(b.dataset.heat) === td.heat));
  const card = $("tdCard");
  const turnName = pname(td.turn);

  if (!td.card) {
    if (me === td.turn) {
      card.innerHTML = `<p class="td-for">Your turn, ${turnName} 💞</p>
        <h3 class="q-topic center">Truth or Dare?</h3>
        <p class="q-sub center">Your partner is watching. Choose wisely.</p>
        <div class="choice-row">
          <button class="btn btn-light" id="pickTruth">💜 Truth</button>
          <button class="btn btn-grad" id="pickDare">🔥 Dare</button>
        </div>`;
      $("pickTruth").addEventListener("click", () => mutate(() => { td.card = drawCard("truth", td.heat); }));
      $("pickDare").addEventListener("click", () => mutate(() => { td.card = drawCard("dare", td.heat); }));
    } else {
      card.innerHTML = `<div class="waiting-box"><div class="big">😏</div>
        <p class="q-topic">${turnName} is choosing…</p>
        <p class="q-sub">Truth, or dare? Get ready either way.</p></div>`;
    }
    return;
  }

  const c = td.card;
  const isMine = me === c.forId;
  card.innerHTML = `
    <p class="td-for">${pname(c.forId)}'s ${c.type === "truth" ? "truth" : "dare"}</p>
    <p class="td-type ${c.type}">${c.type === "truth" ? "💜 TRUTH" : "🔥 DARE"}</p>
    <p class="td-text">${c.text}</p>
    ${isMine
      ? `<p class="q-sub center">Do it / answer it — your partner confirms when it's done.</p>`
      : `<button class="btn btn-grad btn-block" id="tdDone">Done ✓ &nbsp;(+${c.type === "truth" ? 1 : 2} sparks)</button>
         <button class="btn btn-light btn-block mt" id="tdSkip">Skip this one</button>`}`;
  if (!isMine) {
    $("tdDone").addEventListener("click", () => mutate(() => {
      S.sparks += c.type === "truth" ? 1 : 2;
      S.td.card = null;
      S.td.turn = other(c.forId);
    }));
    $("tdSkip").addEventListener("click", () => mutate(() => {
      S.td.card = drawCard(c.type, S.td.heat);
    }));
  }
}

// ---------------- restore session on load ----------------
(function restore() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(SSKEY) || "null"); } catch (e) {}
  if (saved && saved.roomCode && saved.me) {
    me = saved.me;
    roomCode = saved.roomCode;
    myDisplayName = saved.name || "";
    S = saved.S || null;
    roomSeen = !!S;
    if (myDisplayName) $("nameInput").value = myDisplayName;
    updateRoomPill();
    startLoops();
    pollOnce();
  }
  render();
})();
