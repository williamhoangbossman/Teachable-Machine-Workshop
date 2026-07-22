# 🏆 Rock Paper Scissors Pt 3

<p style="color:#6ee7b7;"><strong>Goal:</strong> Add a running scoreboard, a 3-2-1-Shoot countdown before each round reads your hand, and a little "pop" animation on the result so wins and losses actually feel like something.</p>

<details open>
<summary><strong>🗺️ Big Picture</strong></summary>

By the end of Part 2, clicking Play Round instantly read your hand and told you who won - but nothing built up between rounds, and nothing warned you before your hand got read. This part adds three small, independent upgrades on top of that:

1. A scoreboard that keeps a running tally of You / CPU / Draws for as long as the page stays open.
2. A 3-2-1-Shoot countdown overlay that runs *before* the snapshot is taken, so you know exactly when to hold your hand up.
3. A short pop-in animation on the result text, so a win doesn't just silently swap text - it visibly *lands*.

</details>

## Building The Finishing Touches

<details open>
<summary><strong>🔢 <span style="color:#60a5fa;">Step 29: Add The Scoreboard Markup</span></strong></summary>

Inside `<main class="page">`, right before your `.viewfinder` div:

```html
<main class="page">
  <!-- new lines ⬇️ -->
  <div class="scoreboard">
    <div class="score-box">
      <span class="score-label">You</span>
      <span id="score-you" class="score-value">0</span>
    </div>
    <div class="score-box">
      <span class="score-label">Draws</span>
      <span id="score-draws" class="score-value">0</span>
    </div>
    <div class="score-box">
      <span class="score-label">CPU</span>
      <span id="score-cpu" class="score-value">0</span>
    </div>
  </div>
  <!-- new lines ⬆️ -->

  <div class="viewfinder">
    ...
  </div>
  ...
</main>
```

Three `.score-box` blocks, each pairing a small label with a number. All three numbers start at `0` in the HTML - `script.js` will update them as rounds get played, the same "start empty/neutral, let JS fill it in" pattern you've already seen with `#confidence-bars` and `#result`.

</details>

<details>
<summary><strong>🎨 <span style="color:#f472b6;">Step 30: Style The Scoreboard</span></strong></summary>

In `style.css`, add these rules right after `.page`:

```css
.page {
  max-width: 560px;
  margin: 0 auto;
  padding: 48px 24px;
  text-align: center;
}

/* new lines ⬇️ */
.scoreboard {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 20px;
}

.score-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-label {
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--muted);
}

.score-value {
  font-family: "Instrument Sans", system-ui, sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  margin-top: 2px;
}
/* new lines ⬆️ */
```

`.scoreboard` lays the three boxes out in a row with even spacing. Each `.score-box` stacks its own label above its own number. `.score-label` reuses the same small-caps, letter-spaced treatment you've seen on other secondary text in this project, and `.score-value` uses the bolder "Instrument Sans" font - the same one your headings and buttons already use - so the numbers read as the important part.

</details>

<details>
<summary><strong>⏱️ <span style="color:#34d399;">Step 31: Add The Countdown Overlay Markup</span></strong></summary>

Inside `.viewfinder`, right after your `<video>` element:

```html
<div class="viewfinder">
  <video id="webcam" autoplay muted playsinline></video>

  <!-- new lines ⬇️ -->
  <div id="countdown-overlay" class="countdown-overlay hidden">
    <span id="countdown-number" class="countdown-number"></span>
  </div>
  <!-- new lines ⬆️ -->
</div>
```

This sits directly on top of the video feed - you'll style it as an overlay in the next step. It starts with two classes: `countdown-overlay` (its permanent styling) and `hidden` (a brand-new utility class you'll define in Step 32 that hides an element no matter what other styles it has). `script.js` will remove and re-add `hidden` to show and hide this overlay only while a countdown is actually running.

<p style="color:#fbbf24;"><strong>💡 Why a separate `.hidden` class instead of a one-off style?</strong> you'll want this same "hide it, but keep it in the DOM" behavior for other things later in your own projects. One reusable utility class that any element can pick up beats writing a bespoke rule every time you need to hide something.</p>

</details>

<details>
<summary><strong>🎨 <span style="color:#38bdf8;">Step 32: Style The Countdown Overlay</span></strong></summary>

Still in `style.css`, add the `.hidden` utility class right after `.page` (before the scoreboard rules from Step 30 or after - order between the two doesn't matter, as long as both land somewhere before `.viewfinder`):

```css
.hidden {
  display: none !important;
}
```

Then add the overlay's own styles right after `.viewfinder video`:

```css
.viewfinder video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

/* new lines ⬇️ */
.countdown-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
}

.countdown-number {
  font-family: "Instrument Sans", system-ui, sans-serif;
  font-size: 4rem;
  font-weight: 700;
  color: var(--paper);
}
/* new lines ⬆️ */
```

`position: absolute; inset: 0;` stretches the overlay to fill its parent completely - and it can only do that because `.viewfinder` was already given `position: relative` back in Part 1, Step 12. The semi-transparent black background dims the camera feed a bit so the big number stands out, and `.countdown-number` blows the digit up to a size you can read at a glance without leaning toward the screen.

<p style="color:#f87171;"><strong>🚨 Common bug:</strong> the `!important` on `.hidden` is deliberate - `.countdown-overlay` already sets its own `display: flex`, and without `!important`, that more specific rule would win over a plain `.hidden { display: none; }`, leaving the overlay stuck visible.</p>

</details>

<details>
<summary><strong>✨ <span style="color:#c084fc;">Step 33: Add The Result Reveal Animation</span></strong></summary>

No new HTML for this one - you're only adding CSS. At the very end of `style.css`, after your `.result.draw` rule:

```css
.result.draw {
  color: var(--lavender);
}

/* new lines ⬇️ */
.result.reveal {
  animation: pop-in 280ms ease-out;
}

@keyframes pop-in {
  0% {
    transform: scale(0.7);
    opacity: 0;
  }
  60% {
    transform: scale(1.08);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .result.reveal {
    animation: none;
  }
}
/* new lines ⬆️ */
```

`@keyframes pop-in` describes a shape over time: start slightly small and invisible, overshoot a little past full size, then settle back to normal - that overshoot-then-settle is what makes it read as a "pop" instead of a plain fade. `.result.reveal` is the class that actually plays that animation, the same "extra class alongside the base class" pattern from `.result.win`/`.result.lose`/`.result.draw` in Part 2 - except this one gets added and removed by `script.js` on *every* round, win or lose, rather than staying attached.

<p style="color:#a78bfa;"><strong>✨ Accessibility note:</strong> <code>prefers-reduced-motion</code> is a setting some people turn on system-wide because animation can be genuinely uncomfortable or disorienting for them. The `@media` block above respects that automatically - anyone with that setting on still sees the result update, just without the motion.</p>

</details>

## Coding The Finishing Touches

<details>
<summary><strong>📄 <span style="color:#fb7185;">Step 34: Grab The New Elements And Track The Score</span></strong></summary>

Near the top of `script.js`, alongside your other `getElementById` calls:

```js
const playBtn = document.getElementById("play-btn");
const cpuMoveEl = document.getElementById("cpu-move");
const resultEl = document.getElementById("result");

// new lines ⬇️
const countdownOverlay = document.getElementById("countdown-overlay");
const countdownNumberEl = document.getElementById("countdown-number");
const scoreYouEl = document.getElementById("score-you");
const scoreCpuEl = document.getElementById("score-cpu");
const scoreDrawsEl = document.getElementById("score-draws");
// new lines ⬆️

let model = null;

// new lines ⬇️
const score = { you: 0, cpu: 0, draws: 0 };
// new lines ⬆️
```

The five new constants find the elements you just added in Steps 29 and 31. `score` is a single object holding all three running totals together, rather than three separate loose variables - which matters in Step 37, where updating and reading them all at once is easier when they live in one place.

<p style="color:#fbbf24;"><strong>💡 Where does this score live?</strong> entirely in this JavaScript variable, in memory. There's no file, database, or browser storage backing it - refreshing the page resets `score` back to all zeros, same as `barsContainer.children.length === 0` in Part 1 rebuilding the bars from scratch on reload.</p>

</details>

<details>
<summary><strong>⏳ <span style="color:#22c55e;">Step 35: Add A Small Wait Helper</span></strong></summary>

Right after the `score` object:

```js
const score = { you: 0, cpu: 0, draws: 0 };

// new lines ⬇️
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// new lines ⬆️
```

`setTimeout` on its own just runs a callback after a delay - it doesn't work with `await`. `wait(ms)` wraps it in a `Promise` that resolves once that delay is up, which turns "wait 600 milliseconds" into something you can write as `await wait(600);` inside an `async` function, pausing that function's execution right there without freezing the rest of the page.

</details>

<details>
<summary><strong>3️⃣ <span style="color:#2dd4bf;">Step 36: Run The Countdown</span></strong></summary>

After `decideWinner` and before `playRound`:

```js
async function runCountdown() {
  countdownOverlay.classList.remove("hidden");

  for (const label of ["3", "2", "1", "Shoot!"]) {
    countdownNumberEl.textContent = label;
    await wait(600);
  }

  countdownOverlay.classList.add("hidden");
}
```

Removing `"hidden"` reveals the overlay from Step 31. The `for...of` loop then walks through four labels one at a time - because each pass `await`s `wait(600)` before moving to the next label, the loop doesn't race through all four instantly; it genuinely pauses for 600ms on `"3"`, then 600ms on `"2"`, and so on, so the number on screen changes roughly twice a second. Once `"Shoot!"` has had its turn, the overlay is hidden again.

<p style="color:#f87171;"><strong>🚨 Common bug:</strong> if you use `.forEach(...)` instead of a `for...of` loop here, all four labels get set almost instantly - `.forEach` doesn't pause for an `await` inside its callback the way a `for...of` loop does. That's why this needs the loop form, not the array method.</p>

</details>

<details>
<summary><strong>➕ <span style="color:#4ade80;">Step 37: Update The Score</span></strong></summary>

Right after `runCountdown`:

```js
function updateScore(outcome) {
  if (outcome === "win") score.you += 1;
  else if (outcome === "lose") score.cpu += 1;
  else score.draws += 1;

  scoreYouEl.textContent = score.you;
  scoreCpuEl.textContent = score.cpu;
  scoreDrawsEl.textContent = score.draws;
}
```

`outcome` is one of the exact three strings `decideWinner` can return, from Part 2, Step 26 - so the `if`/`else if`/`else` chain covers every possibility without needing a final check. Whichever branch runs, all three score elements get rewritten every time, which keeps the on-screen numbers and the `score` object from ever drifting apart.

</details>

<details>
<summary><strong>🎬 <span style="color:#818cf8;">Step 38: (Re)Play The Result Animation</span></strong></summary>

Right after `updateScore`:

```js
function animateResult() {
  resultEl.classList.remove("reveal");
  void resultEl.offsetWidth; // force a reflow so the animation can restart
  resultEl.classList.add("reveal");
}
```

CSS animations only play when the class that triggers them is *newly added* - if `"reveal"` were already sitting on `#result` from the previous round and you just add it again, the browser sees no change and nothing replays. Removing it first, then adding it back, fixes that - but only if the browser fully registers the removal before the addition. `void resultEl.offsetWidth;` forces exactly that: reading `offsetWidth` makes the browser calculate layout right then, which "locks in" the removed state before `"reveal"` goes back on.

<p style="color:#93c5fd;"><strong>Note:</strong> this is a well-known trick, not something obvious from reading the CSS alone - if you ever see an animation refuse to replay on a repeated event, a forced reflow like this is usually the fix.</p>

</details>

<details>
<summary><strong>🔌 <span style="color:#facc15;">Step 39: Wire It All Into Play Round</span></strong></summary>

Update your `playRound` function from Part 2 to match:

```js
async function playRound() {
  playBtn.disabled = true;

  // new lines ⬇️
  await runCountdown();
  // new lines ⬆️

  const predictions = await model.predict(videoEl);
  const youMove = getTopMove(predictions);

  if (!youMove) {
    cpuMoveEl.textContent = "";
    resultEl.textContent = "Couldn't see a clear move — try again";
    resultEl.className = "result";
    // new lines ⬇️
    animateResult();
    // new lines ⬆️
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
  // new lines ⬇️
  animateResult();

  updateScore(outcome);
  // new lines ⬆️

  playBtn.disabled = false;
}
```

`await runCountdown()` now happens right after the button locks and before anything reads the camera, so the 3-2-1-Shoot sequence plays *before* the snapshot - which is the whole point: you now know exactly which instant your hand gets read. `animateResult()` is called on both paths - the early-return "couldn't see a clear move" path and the normal win/lose/draw path - so the pop plays no matter what the round's outcome was. `updateScore(outcome)` only runs on the normal path, since a round with no clear move isn't a win, loss, or draw for anyone.

<p style="color:#a78bfa;"><strong>✨ Design note:</strong> `updateScore(outcome)` is called after `animateResult()`, not before - order doesn't matter functionally here since they touch different elements, but keeping "make the result look right" and "record the result" as two distinct, sequential steps makes the function easier to read top to bottom.</p>

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
      <div class="scoreboard">
        <div class="score-box">
          <span class="score-label">You</span>
          <span id="score-you" class="score-value">0</span>
        </div>
        <div class="score-box">
          <span class="score-label">Draws</span>
          <span id="score-draws" class="score-value">0</span>
        </div>
        <div class="score-box">
          <span class="score-label">CPU</span>
          <span id="score-cpu" class="score-value">0</span>
        </div>
      </div>

      <div class="viewfinder">
        <video id="webcam" autoplay muted playsinline></video>

        <div id="countdown-overlay" class="countdown-overlay hidden">
          <span id="countdown-number" class="countdown-number"></span>
        </div>
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

.hidden {
  display: none !important;
}

.scoreboard {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 20px;
}

.score-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-label {
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--muted);
}

.score-value {
  font-family: "Instrument Sans", system-ui, sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  margin-top: 2px;
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

.countdown-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
}

.countdown-number {
  font-family: "Instrument Sans", system-ui, sans-serif;
  font-size: 4rem;
  font-weight: 700;
  color: var(--paper);
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
  display: block;
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

.result.reveal {
  animation: pop-in 280ms ease-out;
}

@keyframes pop-in {
  0% {
    transform: scale(0.7);
    opacity: 0;
  }
  60% {
    transform: scale(1.08);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .result.reveal {
    animation: none;
  }
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

const countdownOverlay = document.getElementById("countdown-overlay");
const countdownNumberEl = document.getElementById("countdown-number");
const scoreYouEl = document.getElementById("score-you");
const scoreCpuEl = document.getElementById("score-cpu");
const scoreDrawsEl = document.getElementById("score-draws");

let model = null;

const score = { you: 0, cpu: 0, draws: 0 };

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

async function runCountdown() {
  countdownOverlay.classList.remove("hidden");

  for (const label of ["3", "2", "1", "Shoot!"]) {
    countdownNumberEl.textContent = label;
    await wait(600);
  }

  countdownOverlay.classList.add("hidden");
}

function updateScore(outcome) {
  if (outcome === "win") score.you += 1;
  else if (outcome === "lose") score.cpu += 1;
  else score.draws += 1;

  scoreYouEl.textContent = score.you;
  scoreCpuEl.textContent = score.cpu;
  scoreDrawsEl.textContent = score.draws;
}

function animateResult() {
  resultEl.classList.remove("reveal");
  void resultEl.offsetWidth; // force a reflow so the animation can restart
  resultEl.classList.add("reveal");
}

async function playRound() {
  playBtn.disabled = true;

  await runCountdown();

  const predictions = await model.predict(videoEl);
  const youMove = getTopMove(predictions);

  if (!youMove) {
    cpuMoveEl.textContent = "";
    resultEl.textContent = "Couldn't see a clear move — try again";
    resultEl.className = "result";
    animateResult();
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
  animateResult();

  updateScore(outcome);

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
<summary><strong>🧩 <span style="color:#f0abfc;">What Changed Inside Play Round, Start To Finish</span></strong></summary>

Same function as Part 2, Step 27, with three additions layered in without disturbing the original logic:

```js
await runCountdown();
```

New first step after locking the button - the 3-2-1-Shoot sequence now runs to completion *before* any camera snapshot is taken.

```js
animateResult();
```

Appears on both the early-return "no clear move" path and the normal path - the pop plays every single time `#result`'s text changes, regardless of outcome.

```js
updateScore(outcome);
```

Appears only on the normal path, right after the result text and class are set - a round with no clear move was never a win, loss, or draw, so it never touches the scoreboard.

<p style="color:#86efac;"><strong>🎯 Result:</strong> the sequence per click is now countdown → snapshot → decide → show result (with a pop) → tally the score - five stages instead of Part 2's three, but each new stage is just one extra function call slotted into the same flow.</p>

</details>

## Before You Move On

<details open>
<summary><strong>⚠️ <span style="color:#facc15;">Check That Everything Ties Together</span></strong></summary>

<p style="color:#facc15;"><strong>⚠️ Quick self-check</strong> before calling this project done - not a graded submission, just a sanity check.</p>

- [ ] Click Play Round - the countdown overlay appears over the video, counts `3, 2, 1, Shoot!`, then disappears
- [ ] Hold your move up for `Shoot!`, not for `3` - confirm the snapshot really is taken at the end of the countdown, not the start
- [ ] Play several rounds and confirm the You / Draws / CPU numbers each go up by exactly one, matching that round's actual result
- [ ] Refresh the page and confirm the scoreboard resets to `0 / 0 / 0` - this is expected, not a bug
- [ ] Watch `#result` on back-to-back rounds with the *same* outcome twice in a row (e.g. two wins) - the pop animation should replay both times, not just the first

If the pop animation only plays on the first round and never again, double-check `animateResult()` - specifically the `void resultEl.offsetWidth;` line from Step 38, since that's the line responsible for letting the animation restart on a repeat outcome.

<p style="color:#a78bfa;"><strong>✨ Extra challenge, if you have time:</strong> the scoreboard currently resets every time the page reloads. Look into <code>localStorage</code> (specifically <code>localStorage.getItem</code> and <code>localStorage.setItem</code>) and see if you can make the score survive a page refresh - you'd read the saved score once in <code>init()</code>, and write it back out every time <code>updateScore</code> runs.</p>

</details>

<br>

<div align="center">
<sub><span style="color:#9c99ae;">Built with ✊ ✋ ✌️ and a webcam.</span></sub>
</div>