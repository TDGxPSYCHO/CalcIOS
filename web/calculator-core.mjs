export class CalculatorCore {
  constructor() {
    this.maxHistory = 25;
    this.clearAll();
  }

  clearAll() {
    this.current = "0";
    this.stored = 0;
    this.pending = null;
    this.waiting = false;
    this.error = false;
    this.lastOp = null;
    this.lastRhs = null;
    this.memory = this.memory ?? 0;
    this.history = this.history ?? [];
  }

  clearEntry() {
    if (this.error) {
      this.clearAll();
      return;
    }

    this.current = "0";
    this.waiting = false;
  }

  inputDigit(digit) {
    if (!/^[0-9]$/.test(digit)) return;
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
    if (!["+", "-", "*", "/", "^"].includes(op)) return;

    if (this.pending && !this.waiting) {
      const ok = this.equals();
      if (!ok) return;
    } else if (!this.pending) {
      this.stored = Number(this.current);
    }

    this.pending = op;
    this.waiting = true;
  }

  equals() {
    if (this.error) return false;

    if (this.pending) {
      const rhs = this.waiting ? this.stored : Number(this.current);
      const lhs = this.stored;
      const out = this.apply(lhs, rhs, this.pending);
      if (out === null) return false;

      const expression = `${this.formatPlain(lhs)} ${this.symbol(this.pending)} ${this.formatPlain(rhs)}`;
      this.current = this.formatRaw(out);
      this.stored = out;
      this.lastOp = this.pending;
      this.lastRhs = rhs;
      this.pending = null;
      this.waiting = true;
      this.pushHistory(expression, this.current);
      return true;
    }

    if (this.waiting && this.lastOp && this.lastRhs !== null) {
      const lhs = Number(this.current);
      const out = this.apply(lhs, this.lastRhs, this.lastOp);
      if (out === null) return false;

      const expression = `${this.formatPlain(lhs)} ${this.symbol(this.lastOp)} ${this.formatPlain(this.lastRhs)}`;
      this.current = this.formatRaw(out);
      this.stored = out;
      this.waiting = true;
      this.pushHistory(expression, this.current);
      return true;
    }

    return true;
  }

  apply(lhs, rhs, op) {
    let out;

    if (op === "+") out = lhs + rhs;
    if (op === "-") out = lhs - rhs;
    if (op === "*") out = lhs * rhs;
    if (op === "^") out = lhs ** rhs;
    if (op === "/") {
      if (Math.abs(rhs) < 1e-12) {
        this.setError();
        return null;
      }
      out = lhs / rhs;
    }

    if (!Number.isFinite(out)) {
      this.setError();
      return null;
    }

    return out;
  }

  percent() {
    if (this.error) return;
    this.current = this.formatRaw(Number(this.current) / 100);
    this.waiting = false;
  }

  toggleSign() {
    if (this.error) return;
    if (this.current === "0" || this.current === "0.") return;
    this.current = this.current.startsWith("-") ? this.current.slice(1) : `-${this.current}`;
  }

  backspace() {
    if (this.error) {
      this.clearAll();
      return;
    }

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

  applyUnary(name) {
    if (this.error) return;

    const value = Number(this.current);
    let out;
    if (name === "sqrt") {
      if (value < 0) return this.setError();
      out = Math.sqrt(value);
    }
    if (name === "sin") out = Math.sin(this.toRadians(value));
    if (name === "cos") out = Math.cos(this.toRadians(value));
    if (name === "tan") out = Math.tan(this.toRadians(value));
    if (name === "ln") {
      if (value <= 0) return this.setError();
      out = Math.log(value);
    }
    if (name === "log") {
      if (value <= 0) return this.setError();
      out = Math.log10(value);
    }
    if (name === "inv") {
      if (Math.abs(value) < 1e-12) return this.setError();
      out = 1 / value;
    }

    if (!Number.isFinite(out)) return this.setError();

    const expression = `${name}(${this.formatPlain(value)})`;
    this.current = this.formatRaw(out);
    this.waiting = true;
    this.pushHistory(expression, this.current);
  }

  setPi() {
    if (this.error) this.clearAll();
    this.current = this.formatRaw(Math.PI);
    this.waiting = false;
  }

  memoryClear() {
    this.memory = 0;
  }

  memoryRecall() {
    if (this.error) this.clearAll();
    this.current = this.formatRaw(this.memory);
    this.waiting = false;
  }

  memoryStore() {
    if (this.error) return;
    this.memory = Number(this.current);
  }

  memoryAdd() {
    if (this.error) return;
    this.memory += Number(this.current);
  }

  memorySubtract() {
    if (this.error) return;
    this.memory -= Number(this.current);
  }

  getMemory() {
    return this.memory;
  }

  pushHistory(expression, result) {
    this.history.unshift({
      expression,
      result: this.formatDisplay(result),
      value: result,
      timestamp: new Date().toISOString(),
    });
    this.history = this.history.slice(0, this.maxHistory);
  }

  clearHistory() {
    this.history = [];
  }

  getHistory() {
    return this.history;
  }

  setFromHistory(value) {
    if (this.error) this.clearAll();
    this.current = this.formatRaw(Number(value));
    this.waiting = false;
  }

  setError() {
    this.current = "Error";
    this.error = true;
    this.pending = null;
    this.waiting = false;
  }

  getDisplay() {
    if (this.error) return "Error";
    return this.formatDisplay(this.current);
  }

  getExpression() {
    if (this.error) return "";
    if (this.pending) return `${this.formatDisplay(this.stored)} ${this.symbol(this.pending)}`;
    if (this.lastOp && this.lastRhs !== null && this.waiting) {
      return `${this.symbol(this.lastOp)} ${this.formatDisplay(this.lastRhs)}`;
    }
    return "";
  }

  shouldShowClearEntry() {
    return this.error || this.current !== "0" || this.pending !== null;
  }

  symbol(op) {
    if (op === "*") return "x";
    if (op === "/") return "÷";
    return op;
  }

  toRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  formatRaw(value) {
    if (!Number.isFinite(value)) return "Error";
    const normalized = Math.abs(value) < 1e-12 ? 0 : value;
    return parseFloat(normalized.toFixed(12)).toString();
  }

  formatPlain(value) {
    return this.formatRaw(Number(value));
  }

  formatDisplay(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "Error";

    const abs = Math.abs(numeric);
    if ((abs >= 1e12 || (abs > 0 && abs < 1e-8))) return numeric.toExponential(6);

    const formatter = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 12,
    });

    return formatter.format(numeric);
  }
}
