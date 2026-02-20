#include "CalculatorEngine.hpp"

#include <cmath>
#include <iomanip>
#include <sstream>
#include <stdexcept>

CalculatorEngine::CalculatorEngine()
    : currentInput("0"),
      storedValue(0.0),
      pendingOperator('\0'),
      waitingForNewInput(false),
      errorState(false),
      memoryValue(0.0),
      lastOperator('\0'),
      lastRhs(0.0),
      hasLastRepeat(false) {}

void CalculatorEngine::inputDigit(char digit) {
    if (digit < '0' || digit > '9') return;
    if (errorState) clearAll();

    if (waitingForNewInput) {
        currentInput = "0";
        waitingForNewInput = false;
    }

    if (currentInput == "0") {
        currentInput = std::string(1, digit);
    } else if (currentInput == "-0") {
        currentInput = std::string("-") + digit;
    } else {
        currentInput.push_back(digit);
    }
}

void CalculatorEngine::inputDecimal() {
    if (errorState) clearAll();

    if (waitingForNewInput) {
        currentInput = "0";
        waitingForNewInput = false;
    }

    if (currentInput.find('.') == std::string::npos) {
        currentInput.push_back('.');
    }
}

void CalculatorEngine::setOperator(char op) {
    if (errorState) return;
    if (op != '+' && op != '-' && op != '*' && op != '/' && op != '^') return;

    if (pendingOperator != '\0' && !waitingForNewInput) {
        evaluate();
        if (errorState) return;
    } else if (pendingOperator == '\0') {
        storedValue = parseInput(currentInput);
    }

    pendingOperator = op;
    waitingForNewInput = true;
}

void CalculatorEngine::evaluate() {
    if (errorState) return;

    if (pendingOperator != '\0') {
        const double lhs = storedValue;
        const double rhs = waitingForNewInput ? storedValue : parseInput(currentInput);

        try {
            const double result = applyOperation(lhs, rhs, pendingOperator);
            currentInput = formatNumber(result);
            storedValue = result;
            lastOperator = pendingOperator;
            lastRhs = rhs;
            hasLastRepeat = true;
            pendingOperator = '\0';
            waitingForNewInput = true;
        } catch (const std::exception&) {
            setError();
        }
        return;
    }

    if (waitingForNewInput && hasLastRepeat) {
        try {
            const double lhs = parseInput(currentInput);
            const double result = applyOperation(lhs, lastRhs, lastOperator);
            currentInput = formatNumber(result);
            storedValue = result;
            waitingForNewInput = true;
        } catch (const std::exception&) {
            setError();
        }
    }
}

void CalculatorEngine::clearAll() {
    currentInput = "0";
    storedValue = 0.0;
    pendingOperator = '\0';
    waitingForNewInput = false;
    errorState = false;
    lastOperator = '\0';
    lastRhs = 0.0;
    hasLastRepeat = false;
}

void CalculatorEngine::clearEntry() {
    if (errorState) {
        clearAll();
        return;
    }
    currentInput = "0";
    waitingForNewInput = false;
}

void CalculatorEngine::backspace() {
    if (errorState) {
        clearAll();
        return;
    }

    if (waitingForNewInput) {
        currentInput = "0";
        waitingForNewInput = false;
        return;
    }

    if (currentInput.size() <= 1 || (currentInput.size() == 2 && currentInput[0] == '-')) {
        currentInput = "0";
        return;
    }

    currentInput.pop_back();
}

void CalculatorEngine::toggleSign() {
    if (errorState) return;

    if (currentInput == "0" || currentInput == "0.") return;

    if (!currentInput.empty() && currentInput[0] == '-') {
        currentInput.erase(0, 1);
    } else {
        currentInput = "-" + currentInput;
    }
}

void CalculatorEngine::percent() {
    if (errorState) return;

    const double value = parseInput(currentInput);
    currentInput = formatNumber(value / 100.0);
    waitingForNewInput = false;
}

void CalculatorEngine::memoryClear() {
    memoryValue = 0.0;
}

void CalculatorEngine::memoryRecall() {
    if (errorState) clearAll();
    currentInput = formatNumber(memoryValue);
    waitingForNewInput = false;
}

void CalculatorEngine::memoryStore() {
    if (errorState) return;
    memoryValue = parseInput(currentInput);
}

void CalculatorEngine::memoryAdd() {
    if (errorState) return;
    memoryValue += parseInput(currentInput);
}

void CalculatorEngine::memorySubtract() {
    if (errorState) return;
    memoryValue -= parseInput(currentInput);
}

void CalculatorEngine::setPi() {
    if (errorState) clearAll();
    currentInput = formatNumber(3.14159265358979323846);
    waitingForNewInput = false;
}

void CalculatorEngine::applyUnary(const std::string& fn) {
    if (errorState) return;

    const double value = parseInput(currentInput);
    double out = 0.0;

    if (fn == "sqrt") {
        if (value < 0) return setError();
        out = std::sqrt(value);
    } else if (fn == "sin") {
        out = std::sin(value * 3.14159265358979323846 / 180.0);
    } else if (fn == "cos") {
        out = std::cos(value * 3.14159265358979323846 / 180.0);
    } else if (fn == "tan") {
        out = std::tan(value * 3.14159265358979323846 / 180.0);
    } else if (fn == "ln") {
        if (value <= 0) return setError();
        out = std::log(value);
    } else if (fn == "log") {
        if (value <= 0) return setError();
        out = std::log10(value);
    } else if (fn == "inv") {
        if (std::fabs(value) < 1e-12) return setError();
        out = 1.0 / value;
    } else {
        return;
    }

    if (!std::isfinite(out)) return setError();
    currentInput = formatNumber(out);
    waitingForNewInput = true;
}

std::string CalculatorEngine::getDisplay() const {
    return errorState ? "Error" : currentInput;
}

double CalculatorEngine::getMemoryValue() const {
    return memoryValue;
}

std::string CalculatorEngine::formatNumber(double value) {
    if (std::fabs(value) < 1e-12) value = 0.0;

    std::ostringstream oss;
    oss << std::setprecision(12) << std::fixed << value;
    std::string out = oss.str();

    while (!out.empty() && out.back() == '0') out.pop_back();
    if (!out.empty() && out.back() == '.') out.pop_back();
    if (out.empty() || out == "-0") out = "0";

    return out;
}

double CalculatorEngine::parseInput(const std::string& input) {
    try {
        return std::stod(input);
    } catch (const std::exception&) {
        return 0.0;
    }
}

double CalculatorEngine::applyOperation(double lhs, double rhs, char op) {
    switch (op) {
        case '+': return lhs + rhs;
        case '-': return lhs - rhs;
        case '*': return lhs * rhs;
        case '^': return std::pow(lhs, rhs);
        case '/':
            if (std::fabs(rhs) < 1e-12) {
                throw std::runtime_error("division by zero");
            }
            return lhs / rhs;
        default:
            return rhs;
    }
}

void CalculatorEngine::setError() {
    currentInput = "Error";
    storedValue = 0.0;
    pendingOperator = '\0';
    waitingForNewInput = false;
    errorState = true;
}
