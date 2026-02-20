import { CalculatorCore } from "./calculator-core.mjs";

const calc = new CalculatorCore();

const display = document.getElementById("display");
const expression = document.getElementById("expression");
const clearKey = document.getElementById("clearKey");
const keys = document.querySelector(".keys");
const memoryIndicator = document.getElementById("memoryIndicator");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const modeToggle = document.getElementById("modeToggle");
const graphToggle = document.getElementById("graphToggle");
const scientificPad = document.getElementById("scientificPad");
const graphPanel = document.getElementById("graphPanel");
const graphExpr = document.getElementById("graphExpr");
const plotBtn = document.getElementById("plotBtn");
const graphCanvas = document.getElementById("graphCanvas");
const themeSelect = document.getElementById("themeSelect");
const hapticToggle = document.getElementById("hapticToggle");
const soundToggle = document.getElementById("soundToggle");
const backspaceKey = document.getElementById("backspaceKey");

const settings = loadSettings();
applySettings(settings);

function render() {
  display.textContent = calc.getDisplay();
  expression.textContent = calc.getExpression();
  clearKey.textContent = calc.shouldShowClearEntry() ? "C" : "AC";
  memoryIndicator.textContent = `M: ${calc.formatDisplay(calc.getMemory())}`;

  document.querySelectorAll(".key.op, .skey[data-op]").forEach((button) => {
    button.classList.toggle("active", button.dataset.op === calc.pending);
  });

  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";

  const history = calc.getHistory();
  if (history.length === 0) {
    const li = document.createElement("li");
    li.className = "history-empty";
    li.textContent = "No calculations yet";
    historyList.appendChild(li);
    return;
  }

  history.forEach((item) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.className = "history-item";
    button.innerHTML = `<span>${item.expression}</span><strong>${item.result}</strong>`;
    button.addEventListener("click", () => {
      calc.setFromHistory(item.value);
      feedback();
      render();
    });
    li.appendChild(button);
    historyList.appendChild(li);
  });
}

function handleAction(action) {
  switch (action) {
    case "clear":
      if (calc.shouldShowClearEntry()) calc.clearEntry();
      else calc.clearAll();
      break;
    case "decimal":
      calc.inputDecimal();
      break;
    case "equals":
      calc.equals();
      break;
    case "percent":
      calc.percent();
      break;
    case "sign":
      calc.toggleSign();
      break;
    case "back":
      calc.backspace();
      break;
    default:
      break;
  }

  feedback();
}

function handleMemory(action) {
  if (action === "mc") calc.memoryClear();
  if (action === "mr") calc.memoryRecall();
  if (action === "mplus") calc.memoryAdd();
  if (action === "mminus") calc.memorySubtract();
  if (action === "ms") calc.memoryStore();
  feedback();
}

function handleScience(action) {
  if (action === "pi") calc.setPi();
  else calc.applyUnary(action);
  feedback();
}

function handleKeydown(event) {
  const key = event.key;

  if (/^[0-9]$/.test(key)) calc.inputDigit(key);
  else if (key === ".") calc.inputDecimal();
  else if (["+", "-", "*", "/", "^"].includes(key)) calc.setOperator(key);
  else if (key === "Enter" || key === "=") calc.equals();
  else if (key === "%" || key.toLowerCase() === "p") calc.percent();
  else if (key.toLowerCase() === "n") calc.toggleSign();
  else if (key === "Backspace") calc.backspace();
  else if (key === "Delete") calc.clearEntry();
  else if (key === "Escape") calc.clearAll();
  else if (key.toLowerCase() === "c") {
    if (calc.shouldShowClearEntry()) calc.clearEntry();
    else calc.clearAll();
  } else if (key.toLowerCase() === "s") calc.applyUnary("sin");
  else if (key.toLowerCase() === "o") calc.applyUnary("cos");
  else if (key.toLowerCase() === "t") calc.applyUnary("tan");
  else if (key.toLowerCase() === "l") calc.applyUnary("log");
  else if (key.toLowerCase() === "r") calc.applyUnary("sqrt");
  else return;

  feedback();
  render();
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.digit) calc.inputDigit(button.dataset.digit);
  if (button.dataset.op) calc.setOperator(button.dataset.op);
  if (button.dataset.action) handleAction(button.dataset.action);

  render();
});

document.querySelector(".memory-row").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-mem]");
  if (!button) return;

  handleMemory(button.dataset.mem);
  render();
});

document.getElementById("scientificPad").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.op) calc.setOperator(button.dataset.op);
  if (button.dataset.science) handleScience(button.dataset.science);
  render();
});

clearHistoryBtn.addEventListener("click", () => {
  calc.clearHistory();
  render();
});

modeToggle.addEventListener("click", () => {
  scientificPad.classList.toggle("hidden");
  const pressed = !scientificPad.classList.contains("hidden");
  modeToggle.setAttribute("aria-pressed", String(pressed));
});

graphToggle.addEventListener("click", () => {
  graphPanel.classList.toggle("hidden");
  const pressed = !graphPanel.classList.contains("hidden");
  graphToggle.setAttribute("aria-pressed", String(pressed));
  if (pressed) plotGraph();
});

plotBtn.addEventListener("click", () => plotGraph());

graphExpr.addEventListener("keydown", (event) => {
  if (event.key === "Enter") plotGraph();
});

themeSelect.addEventListener("change", () => {
  settings.theme = themeSelect.value;
  document.body.dataset.theme = settings.theme;
  persistSettings(settings);
});

hapticToggle.addEventListener("change", () => {
  settings.haptics = hapticToggle.checked;
  persistSettings(settings);
});

soundToggle.addEventListener("change", () => {
  settings.sound = soundToggle.checked;
  persistSettings(settings);
});

window.addEventListener("keydown", handleKeydown);

let backspaceTimer = null;
backspaceKey.addEventListener("pointerdown", () => {
  backspaceTimer = setInterval(() => {
    calc.backspace();
    render();
  }, 120);
});

["pointerup", "pointerleave", "pointercancel"].forEach((eventName) => {
  backspaceKey.addEventListener(eventName, () => {
    if (backspaceTimer) {
      clearInterval(backspaceTimer);
      backspaceTimer = null;
    }
  });
});

function plotGraph() {
  const ctx = graphCanvas.getContext("2d");
  const width = graphCanvas.width;
  const height = graphCanvas.height;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();

  const evaluator = buildEvaluator(graphExpr.value.trim());
  if (!evaluator) return;

  ctx.strokeStyle = "#ff9f0a";
  ctx.lineWidth = 2;
  ctx.beginPath();

  for (let pixel = 0; pixel < width; pixel += 1) {
    const x = (pixel - width / 2) / 18;
    const y = evaluator(x);
    if (!Number.isFinite(y)) continue;

    const py = height / 2 - y * 18;
    if (pixel === 0) ctx.moveTo(pixel, py);
    else ctx.lineTo(pixel, py);
  }

  ctx.stroke();
}

function buildEvaluator(expr) {
  const safe = expr.toLowerCase().replace(/\s+/g, "");
  if (!safe) return null;
  if (!/^[0-9x+\-*/().^a-z]+$/.test(safe)) return null;

  const transformed = safe
    .replace(/\^/g, "**")
    .replace(/sin\(/g, "Math.sin(")
    .replace(/cos\(/g, "Math.cos(")
    .replace(/tan\(/g, "Math.tan(")
    .replace(/log\(/g, "Math.log10(")
    .replace(/ln\(/g, "Math.log(")
    .replace(/sqrt\(/g, "Math.sqrt(")
    .replace(/pi/g, "Math.PI");

  try {
    const fn = new Function("x", `return ${transformed};`);
    return (x) => fn(x);
  } catch {
    return null;
  }
}

let audioCtx;
function feedback() {
  if (settings.haptics && navigator.vibrate) navigator.vibrate(8);
  if (!settings.sound) return;

  audioCtx = audioCtx || new AudioContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.value = 440;
  gain.gain.value = 0.02;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.03);
}

function loadSettings() {
  try {
    const raw = localStorage.getItem("calcios.settings");
    if (!raw) return { theme: "aurora", haptics: false, sound: false };
    return { theme: "aurora", haptics: false, sound: false, ...JSON.parse(raw) };
  } catch {
    return { theme: "aurora", haptics: false, sound: false };
  }
}

function applySettings(currentSettings) {
  document.body.dataset.theme = currentSettings.theme;
  themeSelect.value = currentSettings.theme;
  hapticToggle.checked = currentSettings.haptics;
  soundToggle.checked = currentSettings.sound;
}

function persistSettings(currentSettings) {
  localStorage.setItem("calcios.settings", JSON.stringify(currentSettings));
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // no-op in environments that block SW
    });
  });
}

render();
plotGraph();
