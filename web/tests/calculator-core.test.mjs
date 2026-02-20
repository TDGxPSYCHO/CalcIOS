import test from "node:test";
import assert from "node:assert/strict";
import { CalculatorCore } from "../calculator-core.mjs";

test("repeated equals works", () => {
  const calc = new CalculatorCore();
  calc.inputDigit("5");
  calc.setOperator("+");
  calc.inputDigit("2");
  calc.equals();
  assert.equal(calc.getDisplay(), "7");
  calc.equals();
  assert.equal(calc.getDisplay(), "9");
});

test("memory store/add/recall works", () => {
  const calc = new CalculatorCore();
  calc.inputDigit("8");
  calc.memoryStore();
  calc.clearAll();
  calc.memoryRecall();
  assert.equal(calc.getDisplay(), "8");
  calc.memoryAdd();
  calc.memoryRecall();
  assert.equal(calc.getDisplay(), "16");
});

test("scientific functions and power work", () => {
  const calc = new CalculatorCore();
  calc.inputDigit("9");
  calc.applyUnary("sqrt");
  assert.equal(calc.getDisplay(), "3");
  calc.setOperator("^");
  calc.inputDigit("2");
  calc.equals();
  assert.equal(calc.getDisplay(), "9");
});

test("history accumulates results", () => {
  const calc = new CalculatorCore();
  calc.inputDigit("2");
  calc.setOperator("*");
  calc.inputDigit("3");
  calc.equals();
  assert.equal(calc.getHistory().length, 1);
  assert.match(calc.getHistory()[0].expression, /2 x 3/);
});
