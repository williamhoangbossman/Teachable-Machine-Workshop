const MODEL_URL = "./model/model.json";
const METADATA_URL = "./model/metadata.json";

const MOVES = ["Rock", "Paper", "Scissors"];

const videoEl = document.getElementById("webcam");
const barsContainer = document.getElementById("confidence-bars");
const statusEl = document.getElementById("status");

const PlayBtn = document.getElementById("play-btn");
const cpuMoveEl = document.getElementById('cpu-move')
const resultEl = document.getElementById("result")

const countdownOverlay = document.getElementById("countdown-overlay");
const countdownNumberEl = document.getElementById("countdown-number");
const scoreYouEl = document.getElementById("score-you")
const scoreCpuEl = document.getElementById("score-cpu")
const scoreDrawsEl = document.getElementById("score-draws")

let model = null;

const score = {you: 0, cpu: 0, draws: 0};

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

      barsContainer.appendChild(row)
    }
  }

  for (const p of predictions) {
    const row = barsContainer.querySelector(`[data-class-name="${p.className}"]`)
    if (!row) continue;
    const pct = Math.round(p.probability * 100);
    row.querySelector(".bar-fill").style.width = pct + "%"
    row.querySelector(".bar-value").textContent = pct + "%";
  }
}

async function predictionLoop() {
  const predictions = await model.predict(videoEl);
  renderConfidenceBars(predictions);
  requestAnimationFrame(predictionLoop);
}

async function init() {
  try {
    statusEl.textContent = "Loading the damn model bro wait...";
    await loadModel();

    statusEl.textContent = "I'm Requesting the webcam buddy";
    await startWebcam();

    statusEl.textContent = "ur live pal";
    predictionLoop();

    PlayBtn.disabled = false;
    PlayBtn.addEventListener("click", playRound);

  } catch (err) {
    console.error(err);
    statusEl.textContent = "Yo fix this thing cuh";
  }
}

function getTopMove(predictions) {
  const moveOnly = predictions.filter((p) => MOVES.includes(p.className));
  const sorted = [...moveOnly].sort((a, b) => b.probability - a.probability);
  return sorted[0]?.className ?? null
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

  for (const label of ["3", "2", "1", "Canguan!"]) {
    countdownNumberEl.textContent = label;
    await wait(600)
  }

  countdownOverlay.classList.add("hidden")
}

function updateScore(outcome) {
  if (outcome === "win") score.you += 1;
  else if (outcome === "lose") score.cpu += 1;
  else score.draws += 1

  scoreCpuEl.textContent = score.cpu;
  scoreYouEl.textContent = score.you;
  scoreDrawsEl.textContent = score.draws;
}

function animationResult() {
  resultEl.classList.remove("reveal");
  void resultEl.offsetWidth;
  resultEl.classList.add("reveal");
}

async function playRound() {
  PlayBtn.disabled = true;

  await runCountdown()

  const predictions = await model.predict(videoEl);
  const youMove = getTopMove(predictions)

  if (!youMove) {
    cpuMoveEl.textContent = "";
    resultEl.textContent = "Bro I can't see"
    resultEl.className = "result";

    animationResult()

    PlayBtn.disabled = false;
    return;

  }

  const cpuMove = randomCpuMove();
  const outcome = decideWinner(youMove, cpuMove);

  cpuMoveEl.textContent = `You: ${youMove} · CPU: ${cpuMove}`

  if (outcome === "win") {
    resultEl.textContent = "Congrats bro";
  } else if (outcome === "lose") {
    resultEl.textContent = "STUPID"
  } else {
    resultEl.textContent = "Go again"
  }
  resultEl.className = `result ${outcome}`;

animationResult();
updateScore();

PlayBtn.disabled = false;
}

init()
