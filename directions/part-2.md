# 🖐️ Rock Paper Scissors Pt 2

<p style="color:#6ee7b7;"><strong>Goal:</strong> Wire your model's top prediction into real Rock Paper Scissors logic — pick a random move for the CPU, and decide who won.</p>

<details open>
<summary><strong>🗺️ Big Picture</strong></summary>

By the end of Part 1, your page could see your hand and show live confidence bars. It couldn't actually *play* anything yet. This part turns that into a real game: click a button, your top move gets read, the CPU picks a move of its own, and the page tells you who won.

This part has four main pieces:

1. Add the HTML for a Play button and somewhere to show the result.
2. Style those new elements.
3. Write the functions that pick a move, pick a CPU move, and decide a winner.
4. Wire a click on the button to actually run a round.

</details>

## Building The Game UI

<details open>
<summary><strong>🎮 <span style="color:#60a5fa;">Step 21: Add The Play Button And Result Elements</span></strong></summary>

Inside `<main class="page">`, right after your `#status` paragraph from Part 1:

```html
<main class="page">
  <div class="viewfinder">
    ...
  </div>

  <div id="confidence-bars" class="confidence-bars"></div>

  <p id="status" class="status">Loading model…</p>

  <!-- new lines ⬇️ -->
  <button id="play-btn" class="play-btn" disabled>Play Round</button>

  <p id="cpu-move" class="cpu-move"></p>
  <p id="result" class="result"></p>
  <!-- new lines ⬆️ -->
</main>
```

`#play-btn` starts `disabled` — there's no point letting someone click Play before the model has
even loaded. `#cpu-move` will show what you and the CPU each played; `#result` will show who won.
Both start empty, same as `#confidence-bars` did in Part 1 — `script.js` fills them in.

<p style="color:#fbbf24;"><strong>💡 Why disabled by default?</strong> if someone clicks Play before <code>model</code> exists, <code>model.predict(...)</code> would throw an error. Starting the button disabled and only enabling it once loading actually finishes (Step 28) means that error can't happen.</p>

</details>

<details>
<summary><strong>🎨 <span style="color:#f472b6;">Step 22: Style The Game Controls</span></strong></summary>

In `style.css`, add a new color variable for a fourth accent, then the new rules:

```css
:root {
  --ink: #16161d;
  --panel: #1f1f29;
  --well: #262632;
  --line: #33333f;
  --paper: #edebf6;
  --muted: #9c99ae;
  --mint: #a7e3c9;
  --lavender: #c9b9ee;
  /* new line ⬇️ */
  --blush: #f1b4c4;
  /* new line ⬆️ */
}
```

```css
.play-btn {
  margin-top: 20px;
  padding: 10px 24px;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: "Instrument Sans", system-ui, sans-serif;
  border: none;
  border-radius: 999px;
  background: var(--mint);
  color: var(--ink);
  cursor: pointer;
}

.play-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cpu-move {
  margin-top: 16px;
  font-size: 1.1rem;
  color: var(--muted);
}

.result {
  margin-top: 4px;
  font-family: "Instrument Sans", system-ui, sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
}

.result.win {
  color: var(--mint);
}

.result.lose {
  color: var(--blush);
}

.result.draw {
  color: var(--lavender);
}
```

`.play-btn:disabled` dims the button and swaps the cursor so it visibly *looks* unclickable while
`disabled` is set — matching the behavior from Step 21. The three `.result.___` rules don't do
anything by themselves yet; they're waiting for `script.js` to add one of those three class names
onto `#result` alongside the base `.result` class.

<p style="color:#a78bfa;"><strong>✨ Design note:</strong> mint = win, blush = lose, lavender = draw — the same three colors already doing that job on the confidence bars, just reused here so a win/loss/draw always reads the same way anywhere it shows up on the page.</p>

</details>

## Coding The Game Logic

<details>
<summary><strong>📄 <span style="color:#34d399;">Step 23: Define Your Moves And Grab The New Elements</span></strong></summary>

Near the top of `script.js`, alongside `MODEL_URL`/`METADATA_URL`:

```js
const MODEL_URL = "./model/model.json";
const METADATA_URL = "./model/metadata.json";
// new line ⬇️
const MOVES = ["Rock", "Paper", "Scissors"];
// new line ⬆️

const videoEl = document.getElementById("webcam");
const barsContainer = document.getElementById("confidence-bars");
const statusEl = document.getElementById("status");
// new lines ⬇️
const playBtn = document.getElementById("play-btn");
const cpuMoveEl = document.getElementById("cpu-move");
const resultEl = document.getElementById("result");
// new lines ⬆️

let model = null;
```

`MOVES` is a deliberately short list — three strings, not four. `Nothing` is left out on purpose,
since it's a valid *class* for your model but never a valid *move* in the actual game. The three
new `getElementById` calls find the elements you just added in Step 21, the same pattern from Part
1, Step 15.

</details>

<details>
<summary><strong>🎯 <span style="color:#38bdf8;">Step 24: Pick The Player's Top Move</span></strong></summary>

```js
function getTopMove(predictions) {
  const moveOnly = predictions.filter((p) => MOVES.includes(p.className));
  const sorted = [...moveOnly].sort((a, b) => b.probability - a.probability);
  return sorted[0]?.className ?? null;
}
```

`predictions` is the same array shape from Part 1 — one entry per class, each with a `className`
and a `probability`. `.filter(...)` throws out anything whose `className` isn't in `MOVES`, which
in practice means it throws out `Nothing` before ranking anything. `.sort(...)` then puts the
highest-confidence remaining prediction first, and `sorted[0]?.className` reads its name — the
`?.` means if `sorted` is empty (no move classes existed at all), you get `undefined` instead of a
crash, and `?? null` turns that into a clean `null`.

<p style="color:#f87171;"><strong>🚨 Common bug:</strong> filtering out <code>Nothing</code> <em>before</em> sorting, rather than checking afterward whether the overall top prediction happens to be a move, is the whole point of this function. If you sorted first and only checked the winner, a frame where <code>Nothing</code> is winning would return <code>null</code> even if <code>Rock</code> was sitting right behind it at a totally playable confidence.</p>

</details>

<details>
<summary><strong>🎲 <span style="color:#c084fc;">Step 25: Have The CPU Pick A Move</span></strong></summary>

```js
function randomCpuMove() {
  return MOVES[Math.floor(Math.random() * MOVES.length)];
}
```

`Math.random()` returns a decimal between 0 (inclusive) and 1 (exclusive). Multiplying by
`MOVES.length` (3) spreads that out to somewhere between 0 and 3, and `Math.floor(...)` rounds it
down to a whole number — so you always get exactly `0`, `1`, or `2`, each equally likely, and use
that as an index into `MOVES`.

</details>

<details>
<summary><strong>⚖️ <span style="color:#22c55e;">Step 26: Decide The Winner</span></strong></summary>

```js
function decideWinner(youMove, cpuMove) {
  if (youMove === cpuMove) return "draw";

  const beats = {
    Rock: "Scissors",
    Paper: "Rock",
    Scissors: "Paper"
  };

  return beats[youMove] === cpuMove ? "win" : "lose";
}
```

If both moves match, it's a draw — checked first so the rest of the function doesn't have to worry
about that case. `beats` maps each move to the one move it defeats. `beats[youMove]` looks up what
your move beats; if that happens to equal `cpuMove`, you won, otherwise you lost — since with only
three possible moves and the draw case already handled, "not a win" and "not a draw" always means a
loss.

<p style="color:#93c5fd;"><strong>🔄 What's happening:</strong> this function only ever returns one of three exact strings — <code>"win"</code>, <code>"lose"</code>, or <code>"draw"</code> — which is what lets Step 27 use that return value directly as a CSS class name later.</p>

</details>

<details>
<summary><strong>🕹️ <span style="color:#4ade80;">Step 27: Play A Round</span></strong></summary>

```js
async function playRound() {
  playBtn.disabled = true;

  const predictions = await model.predict(videoEl);
  const youMove = getTopMove(predictions);

  if (!youMove) {
    cpuMoveEl.textContent = "";
    resultEl.textContent = "Couldn't see a clear move — try again";
    resultEl.className = "result";
    playBtn.disabled = false;
    return;
  }

  const cpuMove = randomCpuMove();
  const outcome = decideWinner(youMove, cpuMove);

  cpuMoveEl.textContent = `You: ${youMove} · CPU: ${cpuMove}`;

  if (outcome === "win") {
    resultEl.textContent = "You win!";
  } else if (outcome === "lose") {
    resultEl.textContent = "CPU wins!";
  } else {
    resultEl.textContent = "Draw — go again";
  }
  resultEl.className = `result ${outcome}`;

  playBtn.disabled = false;
}
```

This function ties together everything from Steps 23–26. It disables the button immediately so a
round can't be started twice at once, runs one fresh `model.predict(...)` call (a single snapshot,
not the continuous loop from Part 1), and hands the result to `getTopMove`. If that comes back
`null`, it shows a friendly message and stops early — the early `return` means none of the win/lose
logic below it ever runs for a round with no clear move. Otherwise, it gets a CPU move, decides the
outcome, and updates both text elements — `resultEl.className = \`result ${outcome}\`` is what
attaches `.win`, `.lose`, or `.draw` from Step 22's CSS.

<p style="color:#a78bfa;"><strong>✨ Design note:</strong> the button gets re-enabled at the very end of both paths (the early-return "no move" path and the normal path) — worth double-checking your own version does the same, or Play Round will only ever work once.</p>

</details>

<details>
<summary><strong>🔌 <span style="color:#facc15;">Step 28: Wire The Button In</span></strong></summary>

In `init()`, right after the line that starts `predictionLoop()`:

```js
async function init() {
  try {
    statusEl.textContent = "Loading model…";
    await loadModel();

    statusEl.textContent = "Requesting webcam…";
    await startWebcam();

    statusEl.textContent = "Live";
    predictionLoop();

    // new lines ⬇️
    playBtn.disabled = false;
    playBtn.addEventListener("click", playRound);
    // new lines ⬆️
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Something's not wired up yet — check the console.";
  }
}
```

`playBtn.disabled = false` turns the button on now that the model and webcam are both confirmed
working — matching the "why disabled by default" note back in Step 21. `addEventListener("click",
playRound)` connects an actual click to the function from Step 27, without which the button would
just sit there doing nothing no matter how enabled it looked.

</details>

## Full Solution

<details>
<summary><strong>✅ <span style="color:#6ee7b7;">Complete index.html</span></strong></summary>

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rock Paper Scissors</title>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Epilogue:wght@400;500;600&family=Instrument+Sans:wght@600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="style.css" />

    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.5/dist/teachablemachine-image.min.js"></script>
  </head>
  <body>
    <main class="page">
      <div class="viewfinder">
        <video id="webcam" autoplay muted playsinline></video>
      </div>

      <div id="confidence-bars" class="confidence-bars"></div>

      <p id="status" class="status">Loading model…</p>

      <button id="play-btn" class="play-btn" disabled>Play Round</button>

      <p id="cpu-move" class="cpu-move"></p>
      <p id="result" class="result"></p>
    </main>

    <script src="script.js"></script>
  </body>
</html>
```

</details>

<details>
<summary><strong>✅ <span style="color:#6ee7b7;">Complete style.css</span></strong></summary>

```css
:root {
  --ink: #16161d;
  --panel: #1f1f29;
  --well: #262632;
  --line: #33333f;
  --paper: #edebf6;
  --muted: #9c99ae;
  --mint: #a7e3c9;
  --lavender: #c9b9ee;
  --blush: #f1b4c4;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--ink);
  color: var(--paper);
  font-family: "Epilogue", system-ui, sans-serif;
}

.page {
  max-width: 560px;
  margin: 0 auto;
  padding: 48px 24px;
  text-align: center;
}

.viewfinder {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 16px;
  overflow: hidden;
  background: #000;
  border: 1px solid var(--line);
}

.viewfinder video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.confidence-bars {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.8rem;
}

.bar-label {
  width: 84px;
  flex-shrink: 0;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-track {
  flex: 1;
  height: 8px;
  border-radius: 999px;
  background: var(--well);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--mint);
  width: 0%;
  transition: width 120ms linear;
}

.bar-value {
  width: 40px;
  flex-shrink: 0;
  text-align: right;
  color: var(--paper);
}

.status {
  margin-top: 16px;
  font-size: 0.8rem;
  color: var(--muted);
}

.play-btn {
  margin-top: 20px;
  padding: 10px 24px;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: "Instrument Sans", system-ui, sans-serif;
  border: none;
  border-radius: 999px;
  background: var(--mint);
  color: var(--ink);
  cursor: pointer;
}

.play-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cpu-move {
  margin-top: 16px;
  font-size: 1.1rem;
  color: var(--muted);
}

.result {
  margin-top: 4px;
  font-family: "Instrument Sans", system-ui, sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
}

.result.win {
  color: var(--mint);
}

.result.lose {
  color: var(--blush);
}

.result.draw {
  color: var(--lavender);
}
```

</details>

<details>
<summary><strong>✅ <span style="color:#6ee7b7;">Complete script.js</span></strong></summary>

```js
const MODEL_URL = "./model/model.json";
const METADATA_URL = "./model/metadata.json";
const MOVES = ["Rock", "Paper", "Scissors"];

const videoEl = document.getElementById("webcam");
const barsContainer = document.getElementById("confidence-bars");
const statusEl = document.getElementById("status");
const playBtn = document.getElementById("play-btn");
const cpuMoveEl = document.getElementById("cpu-move");
const resultEl = document.getElementById("result");

let model = null;

async function startWebcam() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user", width: 480, height: 360 },
    audio: false
  });
  videoEl.srcObject = stream;
  await new Promise((resolve) => {
    videoEl.onloadedmetadata = resolve;
  });
  await videoEl.play();
}

async function loadModel() {
  model = await tmImage.load(MODEL_URL, METADATA_URL);
}

async function predictionLoop() {
  const predictions = await model.predict(videoEl);
  renderConfidenceBars(predictions);
  requestAnimationFrame(predictionLoop);
}

function renderConfidenceBars(predictions) {
  if (barsContainer.children.length === 0) {
    for (const p of predictions) {
      const row = document.createElement("div");
      row.className = "bar-row";
      row.dataset.className = p.className;
      row.innerHTML = `
        <span class="bar-label">${p.className}</span>
        <span class="bar-track"><span class="bar-fill"></span></span>
        <span class="bar-value">0%</span>
      `;
      barsContainer.appendChild(row);
    }
  }

  for (const p of predictions) {
    const row = barsContainer.querySelector(`[data-class-name="${p.className}"]`);
    if (!row) continue;
    const pct = Math.round(p.probability * 100);
    row.querySelector(".bar-fill").style.width = pct + "%";
    row.querySelector(".bar-value").textContent = pct + "%";
  }
}

function getTopMove(predictions) {
  const moveOnly = predictions.filter((p) => MOVES.includes(p.className));
  const sorted = [...moveOnly].sort((a, b) => b.probability - a.probability);
  return sorted[0]?.className ?? null;
}

function randomCpuMove() {
  return MOVES[Math.floor(Math.random() * MOVES.length)];
}

function decideWinner(youMove, cpuMove) {
  if (youMove === cpuMove) return "draw";

  const beats = {
    Rock: "Scissors",
    Paper: "Rock",
    Scissors: "Paper"
  };

  return beats[youMove] === cpuMove ? "win" : "lose";
}

async function playRound() {
  playBtn.disabled = true;

  const predictions = await model.predict(videoEl);
  const youMove = getTopMove(predictions);

  if (!youMove) {
    cpuMoveEl.textContent = "";
    resultEl.textContent = "Couldn't see a clear move — try again";
    resultEl.className = "result";
    playBtn.disabled = false;
    return;
  }

  const cpuMove = randomCpuMove();
  const outcome = decideWinner(youMove, cpuMove);

  cpuMoveEl.textContent = `You: ${youMove} · CPU: ${cpuMove}`;

  if (outcome === "win") {
    resultEl.textContent = "You win!";
  } else if (outcome === "lose") {
    resultEl.textContent = "CPU wins!";
  } else {
    resultEl.textContent = "Draw — go again";
  }
  resultEl.className = `result ${outcome}`;

  playBtn.disabled = false;
}

async function init() {
  try {
    statusEl.textContent = "Loading model…";
    await loadModel();

    statusEl.textContent = "Requesting webcam…";
    await startWebcam();

    statusEl.textContent = "Live";
    predictionLoop();

    playBtn.disabled = false;
    playBtn.addEventListener("click", playRound);
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Something's not wired up yet — check the console.";
  }
}

init();
```

</details>

<details>
<summary><strong>🧩 <span style="color:#f0abfc;">What Happens When You Click Play Round</span></strong></summary>

Five steps run in order, every single click:

```js
playBtn.disabled = true;
```

Locks the button so a second click can't start a second round mid-way through the first.

```js
const predictions = await model.predict(videoEl);
```

Takes one snapshot reading of the current frame — not the continuous loop from Part 1, just a
single classification.

```js
const youMove = getTopMove(predictions);
```

Narrows that snapshot down to your best *move* (never `Nothing`), or `null` if nothing confident
turned up.

```js
const cpuMove = randomCpuMove();
const outcome = decideWinner(youMove, cpuMove);
```

Only reached if `youMove` wasn't `null` — picks the CPU's move and compares the two.

```js
playBtn.disabled = false;
```

Unlocks the button again, whichever path got here.

<p style="color:#86efac;"><strong>🎯 Result:</strong> every click is a clean, independent round — nothing carries over from the previous click except whatever you can see on screen.</p>

</details>

## Before You Move On

<details open>
<summary><strong>⚠️ <span style="color:#facc15;">Check That The Game Actually Plays Fair</span></strong></summary>

<p style="color:#facc15;"><strong>⚠️ Quick self-check</strong> before treating this part as done — not a graded submission, just a sanity check.</p>

- Play several rounds throwing **Rock** — you should see roughly a third wins, a third losses, a third draws over enough tries (the CPU is random, so any single round can go either way)
- Deliberately throw the move that **beats** whatever you expect the CPU to play, and confirm the result says you won
- Deliberately throw the move that **loses** to a move, and confirm the result says CPU won
- Hold up nothing (empty frame) and click Play — you should get the "couldn't see a clear move" message, not a crash and not a random win/loss

If any matchup consistently gives the wrong result, double-check the `beats` object in
`decideWinner` — it's easy to swap two lines and end up with backwards rules that only show up on
specific matchups.

<p style="color:#a78bfa;"><strong>✨ Extra challenge, if you have time:</strong> <code>getTopMove</code> currently finds the best move among Rock/Paper/Scissors even if <code>Nothing</code> was actually winning overall — which makes the game forgiving of a weak or half-formed gesture. Try changing it to only count a move if it's the single highest-confidence prediction out of <em>all four</em> classes, <code>Nothing</code> included, and see how much stricter that feels to play against.</p>

</details>

<br>

<div align="center">
<sub><span style="color:#9c99ae;">Built with ✊ ✋ ✌️ and a webcam.</span></sub>
</div>