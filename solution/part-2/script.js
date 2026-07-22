// if you copy this code into a new file, make sure the file path specified below matches where you put the model files!
const MODEL_URL = "../../model/model.json";
const METADATA_URL = "../../model/metadata.json";
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

// ---- new: game logic ----------------------------------------------

// Picks the highest-confidence prediction, but only counts it if it's
// actually one of Rock/Paper/Scissors — "Nothing" is never a valid move,
// even if it happens to have the top confidence right now.
function getTopMove(predictions) {
  const moveOnly = predictions.filter((p) => MOVES.includes(p.className));
  const sorted = [...moveOnly].sort((a, b) => b.probability - a.probability);
  return sorted[0]?.className ?? null;
}

function randomCpuMove() {
  return MOVES[Math.floor(Math.random() * MOVES.length)];
}

// Returns "win", "lose", or "draw" from the player's perspective.
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

// ---- boot -----------------------------------------------------------

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