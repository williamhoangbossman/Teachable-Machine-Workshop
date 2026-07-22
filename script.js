// ============================================================
// PART 1 - Confidence Monitor
//
// Your job in this file: fill in the two TODO sections below so
// the page loads your trained model and shows a live confidence
// bar for every class it knows about.
//
// Everything else (webcam setup, the HTML bar elements) is
// already wired up for you.
// ============================================================

// ---- 1. Point this at YOUR exported model -------------------
//
// In Teachable Machine: Export Model -> Tensorflow.js -> Download.
// That gives you three files: model.json, metadata.json, weights.bin.
// Put all three in a folder called "model" next to this script,
// then leave the paths below as they are.
//
// (If you'd rather host your model instead of using local files,
// you can point these at a URL that ends in model.json /
// metadata.json - either way works with tmImage.load below.)
const MODEL_URL = "./model/model.json";
const METADATA_URL = "./model/metadata.json";

const videoEl = document.getElementById("webcam");
const barsContainer = document.getElementById("confidence-bars");
const statusEl = document.getElementById("status");

let model = null;

// ---- Webcam setup (given - no need to change this) -----------

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

// ---- 2. TODO: load your model ---------------------------------
//
// tmImage.load(modelURL, metadataURL) returns a Promise that
// resolves to a model object. You'll need that model object later
// to run predictions, so store it in the `model` variable above.
//
// Docs: https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

async function loadModel() {
  // TODO: replace this with a real call to tmImage.load(...)
  throw new Error("loadModel() is not implemented yet - see the TODO above.");
}

// ---- 3. TODO: classify the webcam feed, then render bars -------
//
// Once `model` is loaded, model.predict(videoEl) returns a Promise
// that resolves to an array like:
//   [ { className: "Rock", probability: 0.83 }, ... ]
//
// You'll want to:
//   1. Call model.predict(videoEl) to get that array
//   2. Pass it to renderConfidenceBars(predictions) below
//   3. Call this function again on the next animation frame,
//      so the bars keep updating live (requestAnimationFrame)

async function predictionLoop() {
  // TODO: replace this with a real prediction + render + loop
  throw new Error("predictionLoop() is not implemented yet - see the TODO above.");
}

// ---- Rendering helper (given - call this from predictionLoop) --

function renderConfidenceBars(predictions) {
  // Build the bar rows once, then just update widths after that,
  // so the layout doesn't flicker every frame.
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

// ---- Boot sequence (given) --------------------------------------

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
