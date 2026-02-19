class Calculator {
  constructor() {
    this.clearAll();
  }

  clearAll() {
    this.current = "0";
    this.stored = 0;
    this.pending = null;
    this.waiting = false;
    this.error = false;
  }

  clearEntry() {
    if (this.error) return this.clearAll();
    this.current = "0";
    this.waiting = false;
  }

  inputDigit(digit) {
    if (this.error) this.clearAll();

    if (this.waiting) {
      this.current = "0";
      this.waiting = false;
    }

    if (this.current === "0") this.current = digit;
    else if (this.current === "-0") this.current = `-${digit}`;
    else this.current += digit;
  }

  inputDecimal() {
    if (this.error) this.clearAll();

    if (this.waiting) {
      this.current = "0";
      this.waiting = false;
    }

    if (!this.current.includes(".")) this.current += ".";
  }

  setOperator(op) {
    if (this.error) return;

    if (this.pending && !this.waiting) this.equals();
    else this.stored = Number(this.current);

    this.pending = op;
    this.waiting = true;
  }

  equals() {
    if (this.error || !this.pending || this.waiting) return;

    const rhs = Number(this.current);
    const lhs = this.stored;
    let out;

    if (this.pending === "+") out = lhs + rhs;
    if (this.pending === "-") out = lhs - rhs;
    if (this.pending === "*") out = lhs * rhs;
    if (this.pending === "/") {
      if (Math.abs(rhs) < 1e-12) {
        this.current = "Error";
        this.error = true;
        this.pending = null;
        return;
      }
      out = lhs / rhs;
    }

    this.current = this.format(out);
    this.stored = out;
    this.pending = null;
    this.waiting = true;
  }

  percent() {
    if (this.error) return;
    this.current = this.format(Number(this.current) / 100);
    this.waiting = false;
  }

  toggleSign() {
    if (this.error) return;
    if (this.current === "0" || this.current === "0.") return;
    this.current = this.current.startsWith("-") ? this.current.slice(1) : `-${this.current}`;
  }

  backspace() {
    if (this.error) return this.clearAll();
    if (this.waiting) {
      this.current = "0";
      this.waiting = false;
      return;
    }
    if (this.current.length <= 1 || (this.current.length === 2 && this.current.startsWith("-"))) {
      this.current = "0";
      return;
    }
    this.current = this.current.slice(0, -1);
  }

  format(value) {
    if (!Number.isFinite(value)) return "Error";
    if (Math.abs(value) < 1e-12) value = 0;
    return parseFloat(value.toFixed(12)).toString();
  }

  getDisplay() {
    return this.current;
  }
}

const calc = new Calculator();
const display = document.getElementById("display");
const keys = document.querySelector(".keys");

function render() {
  display.textContent = calc.getDisplay();
}

keys.addEventListener("click", (event) => {
  const btn = event.target.closest("button");
  if (!btn) return;

  if (btn.dataset.digit) calc.inputDigit(btn.dataset.digit);
  if (btn.dataset.op) calc.setOperator(btn.dataset.op);

  switch (btn.dataset.action) {
    case "clear":
      calc.clearAll();
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

  render();
});

window.addEventListener("keydown", (event) => {
  if (/^[0-9]$/.test(event.key)) calc.inputDigit(event.key);
  else if (event.key === ".") calc.inputDecimal();
  else if (["+", "-", "*", "/"].includes(event.key)) calc.setOperator(event.key);
  else if (event.key === "Enter" || event.key === "=") calc.equals();
  else if (event.key === "%") calc.percent();
  else if (event.key === "Backspace") calc.backspace();
  else if (event.key.toLowerCase() === "c") calc.clearAll();
  else return;

  render();
});

render();
