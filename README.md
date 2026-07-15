<div align="center">

<h1>✊ Part 1 - Confidence Monitor ✋</h1>
<p><strong><span style="color:#a7e3c9;">Rock</span> · <span style="color:#f1b4c4;">Paper</span> · <span style="color:#c9b9ee;">Scissors</span></strong> - a step-by-step build guide ✌️</p>

![HTML5](https://img.shields.io/badge/HTML5-16161D?style=for-the-badge&logo=html5&logoColor=A7E3C9)
![CSS3](https://img.shields.io/badge/CSS3-16161D?style=for-the-badge&logo=css3&logoColor=C9B9EE)
![JavaScript](https://img.shields.io/badge/JavaScript-16161D?style=for-the-badge&logo=javascript&logoColor=F1B4C4)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-16161D?style=for-the-badge&logo=tensorflow&logoColor=A7E3C9)

</div>

<br>

This walks through building `script.js` (and the two HTML pieces it depends on) from scratch, one
small piece at a time. Each step says **what to write** and **why it matters**. Click a step to
expand it. The full solution is at the bottom if you want to check your work or skip ahead - but
try each step yourself first.

<br>

<div style="background:#1f1f29;border-left:4px solid #c9b9ee;padding:14px 18px;border-radius:8px;">
<strong style="color:#c9b9ee;">📋 Before you start</strong><br>
<span style="color:#edebf6;">
You should have already trained a model in Teachable Machine with four classes -
<code>Rock</code>, <code>Paper</code>, <code>Scissors</code>, <code>Nothing</code> - and exported
it as <strong>Tensorflow.js → Download my model</strong>. Unzip the three files
(<code>model.json</code>, <code>metadata.json</code>, <code>weights.bin</code>) into a
<code>model/</code> folder next to <code>index.html</code>.
</span>
</div>

<br>

## 🗺️ Steps

- [Step 1 - Load the Teachable Machine library](#step-1)
- [Step 2 - Build the HTML skeleton](#step-2)
- [Step 3 - Grab references to those elements](#step-3)
- [Step 4 - Point at your model files](#step-4)
- [Step 5 - Start the webcam](#step-5)
- [Step 6 - Load the model](#step-6)
- [Step 7 - Turn predictions into bar rows](#step-7)
- [Step 8 - Classify the webcam feed, continuously](#step-8)
- [Step 9 - Tie it together and start everything](#step-9)
- [✅ Definition of done](#definition-of-done)
- [📦 Full solution](#full-solution)

<br>

<details id="step-1">
<summary><strong style="color:#a7e3c9;font-size:1.05em;">🟢 Step 1 - Load the Teachable Machine library</strong></summary>

<br>

In `index.html`, inside `<head>`, add:

```html
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.5/dist/teachablemachine-image.min.js"></script>
```

<div style="background:#1f1f29;border-left:4px solid #a7e3c9;padding:12px 16px;border-radius:6px;margin-top:8px;">
<strong style="color:#a7e3c9;">💡 What this does:</strong>
<span style="color:#edebf6;">these two <code>&lt;script&gt;</code> tags download Google's
machine-learning libraries from a CDN and make them available as global objects -
<code>tf</code> and <code>tmImage</code> - that any script on the page can use afterward. This has
to come <em>before</em> your own <code>script.js</code> tag, since your code depends on
<code>tmImage</code> existing already.</span>
</div>

</details>

<br>

<details id="step-2">
<summary><strong style="color:#a7e3c9;font-size:1.05em;">🟢 Step 2 - Build the HTML skeleton</strong></summary>

<br>

Still in `index.html`, inside `<body>`, add:

```html
<video id="webcam" autoplay muted playsinline></video>
<div id="confidence-bars"></div>
<p id="status">Loading model…</p>
<script src="script.js"></script>
```

<div style="background:#1f1f29;border-left:4px solid #a7e3c9;padding:12px 16px;border-radius:6px;margin-top:8px;">
<strong style="color:#a7e3c9;">💡 What this does:</strong>
<span style="color:#edebf6;"><code>&lt;video id="webcam"&gt;</code> is where the live camera feed
will be displayed - you'll attach the actual camera stream to it in JavaScript.
<code>autoplay muted playsinline</code> are required for browsers to let a video start without the
user clicking play first. <code>#confidence-bars</code> starts empty - your JavaScript will build
a row inside it for every class your model knows about. <code>#status</code> is just a small text
line so you (and the browser) can tell what's currently happening - loading, waiting on camera
permission, or live.</span>
</div>

</details>

<br>

<details id="step-3">
<summary><strong style="color:#c9b9ee;font-size:1.05em;">🟣 Step 3 - Grab references to those elements in <code>script.js</code></strong></summary>

<br>

```js
const videoEl = document.getElementById("webcam");
const barsContainer = document.getElementById("confidence-bars");
const statusEl = document.getElementById("status");

let model = null;
```

<div style="background:#1f1f29;border-left:4px solid #c9b9ee;padding:12px 16px;border-radius:6px;margin-top:8px;">
<strong style="color:#c9b9ee;">💡 What this does:</strong>
<span style="color:#edebf6;"><code>document.getElementById(...)</code> finds the HTML elements
from Step 2 so your code can read from or write to them later - <code>videoEl</code> is how you'll
attach the camera stream, <code>barsContainer</code> is where you'll insert bar rows,
<code>statusEl</code> is what you'll update with progress messages. <code>model</code> starts as
<code>null</code> because nothing's loaded yet; you'll assign the real model to it in Step 6.</span>
</div>

</details>

<br>

<details id="step-4">
<summary><strong style="color:#c9b9ee;font-size:1.05em;">🟣 Step 4 - Point at your model files</strong></summary>

<br>

```js
const MODEL_URL = "./model/model.json";
const METADATA_URL = "./model/metadata.json";
```

<div style="background:#1f1f29;border-left:4px solid #c9b9ee;padding:12px 16px;border-radius:6px;margin-top:8px;">
<strong style="color:#c9b9ee;">💡 What this does:</strong>
<span style="color:#edebf6;">these are just the file paths to the model you exported from
Teachable Machine. <code>model.json</code> describes the network's structure and where to find its
weights; <code>metadata.json</code> holds the class names (<code>Rock</code>, <code>Paper</code>,
...) in the order you trained them. Both get passed to <code>tmImage.load</code> in Step 6.</span>
</div>

</details>

<br>

<details id="step-5">
<summary><strong style="color:#f1b4c4;font-size:1.05em;">🩷 Step 5 - Start the webcam</strong></summary>

<br>

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

<div style="background:#1f1f29;border-left:4px solid #f1b4c4;padding:12px 16px;border-radius:6px;margin-top:8px;">
<strong style="color:#f1b4c4;">💡 What this does:</strong>
<span style="color:#edebf6;"><code>navigator.mediaDevices.getUserMedia(...)</code> is the browser
API that asks the user for camera permission and hands back a live video <code>stream</code> if
they allow it. <code>facingMode: "user"</code> requests the front-facing camera. Setting
<code>videoEl.srcObject = stream</code> is what actually connects that stream to the
<code>&lt;video&gt;</code> element from Step 2. The <code>Promise</code> that waits for
<code>onloadedmetadata</code> makes sure the video has real dimensions before you call
<code>.play()</code> - skipping that can cause <code>.play()</code> to fail silently in some
browsers.</span>
</div>

</details>

<br>

<details id="step-6">
<summary><strong style="color:#f1b4c4;font-size:1.05em;">🩷 Step 6 - Load the model</strong></summary>

<br>

```js
async function loadModel() {
  model = await tmImage.load(MODEL_URL, METADATA_URL);
}
```

<div style="background:#1f1f29;border-left:4px solid #f1b4c4;padding:12px 16px;border-radius:6px;margin-top:8px;">
<strong style="color:#f1b4c4;">💡 What this does:</strong>
<span style="color:#edebf6;"><code>tmImage.load(modelURL, metadataURL)</code> is provided by the
library from Step 1. It fetches your model files and builds a ready-to-use model object, which you
store in the <code>model</code> variable declared in Step 3 so the rest of your code can use it.
This line is <code>async</code> and uses <code>await</code> because loading model files takes time
- your code pauses here until it's done rather than moving on with an unfinished model.</span>
</div>

</details>

<br>

<details id="step-7">
<summary><strong style="color:#a7e3c9;font-size:1.05em;">🟢 Step 7 - Turn predictions into bar rows</strong></summary>

<br>

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

<div style="background:#1f1f29;border-left:4px solid #a7e3c9;padding:12px 16px;border-radius:6px;margin-top:8px;">
<strong style="color:#a7e3c9;">💡 What this does:</strong>
<span style="color:#edebf6;">this function takes the array of predictions your model produces (one
entry per class, each with a <code>className</code> and a <code>probability</code> from 0-1) and
turns it into visible bars. The first block only runs once - the very first time it notices
<code>barsContainer</code> is empty - and builds one <code>.bar-row</code> per class, tagging each
with <code>data-class-name</code> so it can be found again later. The second block runs every time
and just updates the width and text of the existing bars, rather than rebuilding them - this keeps
the bars smoothly resizing instead of flickering as they get recreated 30+ times a second.</span>
</div>

</details>

<br>

<details id="step-8">
<summary><strong style="color:#c9b9ee;font-size:1.05em;">🟣 Step 8 - Classify the webcam feed, continuously</strong></summary>

<br>

```js
async function predictionLoop() {
  const predictions = await model.predict(videoEl);
  renderConfidenceBars(predictions);
  requestAnimationFrame(predictionLoop);
}
```

<div style="background:#1f1f29;border-left:4px solid #c9b9ee;padding:12px 16px;border-radius:6px;margin-top:8px;">
<strong style="color:#c9b9ee;">💡 What this does:</strong>
<span style="color:#edebf6;"><code>model.predict(videoEl)</code> runs your model on the
<em>current</em> video frame and returns an array like
<code>[{ className: "Rock", probability: 0.83 }, ...]</code> - one entry per class, sorted however
the model returns them. That array gets handed to <code>renderConfidenceBars</code> from Step 7.
The last line, <code>requestAnimationFrame(predictionLoop)</code>, schedules this same function to
run again right before the browser's next repaint - which is what makes this a continuous
<strong>loop</strong> rather than a single one-off check. Each call to <code>predictionLoop</code>
re-triggers the next one, so once it starts, it keeps going on its own.</span>
</div>

</details>

<br>

<details id="step-9">
<summary><strong style="color:#f1b4c4;font-size:1.05em;">🩷 Step 9 - Tie it together and start everything</strong></summary>

<br>

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
    statusEl.textContent = "Something's not wired up yet - check the console.";
  }
}

init();
```

<div style="background:#1f1f29;border-left:4px solid #f1b4c4;padding:12px 16px;border-radius:6px;margin-top:8px;">
<strong style="color:#f1b4c4;">💡 What this does:</strong>
<span style="color:#edebf6;"><code>init()</code> runs the two setup steps in order - model first,
then webcam - and updates <code>#status</code> so you always know what stage you're at. It's
wrapped in <code>try/catch</code> so that if either step fails (camera permission denied, wrong
file path, etc.) you get a clear message instead of a silent broken page.
<code>predictionLoop()</code> is called once at the end, without <code>await</code>, because - as
covered in Step 8 - it keeps rescheduling itself from here on; nothing after it needs to wait for
it to "finish," since it never does. The final line, <code>init();</code>, is what actually kicks
off all of this the moment the page loads.</span>
</div>

</details>

<br>

## <a id="definition-of-done"></a>✅ Definition of done

<div style="background:#1f1f29;border-left:4px solid #a7e3c9;padding:16px 20px;border-radius:8px;">
<span style="color:#edebf6;">

Open the page and test one class at a time:

- [ ] Hold up **<span style="color:#a7e3c9;">Rock</span>** - its bar reaches at least 70% and stays there for a couple of seconds
- [ ] Hold up **<span style="color:#edebf6;">Paper</span>** - same test
- [ ] Hold up **<span style="color:#f1b4c4;">Scissors</span>** - same test
- [ ] Move your hand out of frame entirely - **<span style="color:#c9b9ee;">Nothing</span>** becomes the highest bar

</span>
</div>

<br>

> ⚠️ If a class won't cooperate, that's a **training-data problem, not a code problem** - add more
> (and more varied) samples for that class in Teachable Machine, retrain, re-export, and try again.

<br>

<div style="background:#262632;border:1px solid #33333f;padding:14px 18px;border-radius:8px;">
<strong style="color:#a7e3c9;">📹 Submit:</strong>
<span style="color:#edebf6;">a 10-20 second screen recording showing all four checks passing in
order.</span>
</div>

<br>

## <a id="full-solution"></a>📦 Full solution

If you get stuck, here's the complete, working version of all three files.

<details>
<summary><strong style="color:#a7e3c9;">📄 index.html</strong></summary>

<br>

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Part 1 - Confidence Monitor</title>

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

</details>

<br>

<details>
<summary><strong style="color:#c9b9ee;">🎨 style.css</strong></summary>

<br>

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

</details>

<br>

<details>
<summary><strong style="color:#f1b4c4;">⚙️ script.js</strong></summary>

<br>

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
    statusEl.textContent = "Something's not wired up yet - check the console.";
  }
}

init();
```

</details>

<br>

<div align="center">
<sub><span style="color:#9c99ae;">Built with ✊ ✋ ✌️ and a webcam.</span></sub>
</div>