# Part 1 — Confidence Monitor: Step-by-Step

This walks through building `script.js` (and the two HTML pieces it depends on) from scratch,
one small piece at a time. Each step says what to write and why it matters. The full solution is
at the bottom if you want to check your work or skip ahead — but try each step yourself first.

## Before you start

You should have already trained a model in Teachable Machine with four classes — `Rock`, `Paper`,
`Scissors`, `Nothing` — and exported it as **Tensorflow.js → Download my model**. Unzip the three
files (`model.json`, `metadata.json`, `weights.bin`) into a `model/` folder next to `index.html`.

---

## Step 1 — Load the Teachable Machine library

In `index.html`, inside `<head>`, add:

```html
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.5/dist/teachablemachine-image.min.js"></script>
```

**What this does:** these two `<script>` tags download Google's machine-learning libraries from a
CDN and make them available as global objects — `tf` and `tmImage` — that any script on the page
can use afterward. This has to come *before* your own `script.js` tag, since your code depends on
`tmImage` existing already.

---

## Step 2 — Build the HTML skeleton

Still in `index.html`, inside `<body>`, add:

```html
<video id="webcam" autoplay muted playsinline></video>
<div id="confidence-bars"></div>
<p id="status">Loading model…</p>
<script src="script.js"></script>
```

**What this does:** `<video id="webcam">` is where the live camera feed will be displayed — you'll
attach the actual camera stream to it in JavaScript. `autoplay muted playsinline` are required for
browsers to let a video start without the user clicking play first. `#confidence-bars` starts
empty — your JavaScript will build a row inside it for every class your model knows about.
`#status` is just a small text line so you (and the browser) can tell what's currently happening —
loading, waiting on camera permission, or live.

---

## Step 3 — Grab references to those elements in `script.js`

```js
const videoEl = document.getElementById("webcam");
const barsContainer = document.getElementById("confidence-bars");
const statusEl = document.getElementById("status");

let model = null;
```

**What this does:** `document.getElementById(...)` finds the HTML elements from Step 2 so your
code can read from or write to them later — `videoEl` is how you'll attach the camera stream,
`barsContainer` is where you'll insert bar rows, `statusEl` is what you'll update with progress
messages. `model` starts as `null` because nothing's loaded yet; you'll assign the real model to
it in Step 5.

---

## Step 4 — Point at your model files

```js
const MODEL_URL = "./model/model.json";
const METADATA_URL = "./model/metadata.json";
```

**What this does:** these are just the file paths to the model you exported from Teachable
Machine. `model.json` describes the network's structure and where to find its weights;
`metadata.json` holds the class names (`Rock`, `Paper`, ...) in the order you trained them. Both
get passed to `tmImage.load` in Step 5.

---

## Step 5 — Start the webcam

```js
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
```

**What this does:** `navigator.mediaDevices.getUserMedia(...)` is the browser API that asks the
user for camera permission and hands back a live video `stream` if they allow it.
`facingMode: "user"` requests the front-facing camera. Setting `videoEl.srcObject = stream` is what
actually connects that stream to the `<video>` element from Step 2. The `Promise` that waits for
`onloadedmetadata` makes sure the video has real dimensions before you call `.play()` — skipping
that can cause `.play()` to fail silently in some browsers.

---

## Step 6 — Load the model

```js
async function loadModel() {
  model = await tmImage.load(MODEL_URL, METADATA_URL);
}
```

**What this does:** `tmImage.load(modelURL, metadataURL)` is provided by the library from Step 1.
It fetches your model files and builds a ready-to-use model object, which you store in the `model`
variable declared in Step 3 so the rest of your code can use it. This line is `async` and uses
`await` because loading model files takes time — your code pauses here until it's done rather than
moving on with an unfinished model.

---

## Step 7 — Turn predictions into bar rows

```js
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
```

**What this does:** this function takes the array of predictions your model produces (one entry
per class, each with a `className` and a `probability` from 0–1) and turns it into visible bars.
The first block only runs once — the very first time it notices `barsContainer` is empty — and
builds one `.bar-row` per class, tagging each with `data-class-name` so it can be found again
later. The second block runs every time and just updates the width and text of the existing bars,
rather than rebuilding them — this keeps the bars smoothly resizing instead of flickering as they
get recreated 30+ times a second.

---

## Step 8 — Classify the webcam feed, continuously

```js
async function predictionLoop() {
  const predictions = await model.predict(videoEl);
  renderConfidenceBars(predictions);
  requestAnimationFrame(predictionLoop);
}
```

**What this does:** `model.predict(videoEl)` runs your model on the *current* video frame and
returns an array like `[{ className: "Rock", probability: 0.83 }, ...]` — one entry per class,
sorted however the model returns them. That array gets handed to `renderConfidenceBars` from Step
7. The last line, `requestAnimationFrame(predictionLoop)`, schedules this same function to run
again right before the browser's next repaint — which is what makes this a continuous *loop*
rather than a single one-off check. Each call to `predictionLoop` re-triggers the next one, so
once it starts, it keeps going on its own.

---

## Step 9 — Tie it together and start everything

```js
async function init() {
  try {
    statusEl.textContent = "Loading model…";
    await loadModel();

    statusEl.textContent = "Requesting webcam…";
    await startWebcam();

    statusEl.textContent = "Live";
    predictionLoop();
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Something's not wired up yet — check the console.";
  }
}

init();
```

**What this does:** `init()` runs the two setup steps in order — model first, then webcam — and
updates `#status` so you always know what stage you're at. It's wrapped in `try/catch` so that if
either step fails (camera permission denied, wrong file path, etc.) you get a clear message
instead of a silent broken page. `predictionLoop()` is called once at the end, without `await`,
because — as covered in Step 8 — it keeps rescheduling itself from here on; nothing after it needs
to wait for it to "finish," since it never does. The final line, `init();`, is what actually kicks
off all of this the moment the page loads.

---

## Definition of done

Open the page and test one class at a time:

- [ ] Hold up **Rock** — its bar reaches at least 70% and stays there for a couple of seconds
- [ ] Hold up **Paper** — same test
- [ ] Hold up **Scissors** — same test
- [ ] Move your hand out of frame entirely — **Nothing** becomes the highest bar

If a class won't cooperate, that's a training-data problem, not a code problem — add more (and
more varied) samples for that class in Teachable Machine, retrain, re-export, and try again.

**Submit:** a 10–20 second screen recording showing all four checks passing in order.

---

## Full solution

If you get stuck, here's the complete, working version of all three files.

### `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Part 1 — Confidence Monitor</title>

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
      <header class="page-header">
        <p class="eyebrow">Part 1</p>
        <h1>Confidence Monitor</h1>
        <p class="subtitle">
          Show the model your webcam feed and watch it guess what it's looking at, live.
        </p>
      </header>

      <div class="viewfinder">
        <video id="webcam" autoplay muted playsinline></video>
      </div>

      <div id="confidence-bars" class="confidence-bars"></div>

      <p id="status" class="status">Loading model…</p>
    </main>

    <script src="script.js"></script>
  </body>
</html>
```

### `style.css`

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

.eyebrow {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.3em;
  color: var(--lavender);
}

h1 {
  font-family: "Instrument Sans", system-ui, sans-serif;
  font-weight: 700;
  font-size: 2rem;
  margin: 8px 0 4px;
}

.subtitle {
  margin: 0 0 32px;
  color: var(--muted);
  font-size: 0.95rem;
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
```

### `script.js`

```js
const MODEL_URL = "./model/model.json";
const METADATA_URL = "./model/metadata.json";

const videoEl = document.getElementById("webcam");
const barsContainer = document.getElementById("confidence-bars");
const statusEl = document.getElementById("status");

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

async function init() {
  try {
    statusEl.textContent = "Loading model…";
    await loadModel();

    statusEl.textContent = "Requesting webcam…";
    await startWebcam();

    statusEl.textContent = "Live";
    predictionLoop();
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Something's not wired up yet — check the console.";
  }
}

init();
```
