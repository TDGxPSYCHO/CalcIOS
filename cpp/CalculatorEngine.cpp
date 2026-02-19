#include "CalculatorEngine.hpp"

#include <cmath>
#include <iomanip>
#include <sstream>
#include <stdexcept>

CalculatorEngine::CalculatorEngine()
    : currentInput("0"), storedValue(0.0), pendingOperator('\0'), waitingForNewInput(false), errorState(false) {}

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
    if (op != '+' && op != '-' && op != '*' && op != '/') return;

    if (pendingOperator != '\0' && !waitingForNewInput) {
        evaluate();
        if (errorState) return;
    } else {
        storedValue = parseInput(currentInput);
    }

    pendingOperator = op;
    waitingForNewInput = true;
}

void CalculatorEngine::evaluate() {
    if (errorState || pendingOperator == '\0' || waitingForNewInput) return;

    try {
        const double rhs = parseInput(currentInput);
        const double result = applyOperation(storedValue, rhs, pendingOperator);
        currentInput = formatNumber(result);
        storedValue = result;
        pendingOperator = '\0';
        waitingForNewInput = true;
    } catch (const std::exception&) {
        setError();
    }
}

void CalculatorEngine::clearAll() {
    currentInput = "0";
    storedValue = 0.0;
    pendingOperator = '\0';
    waitingForNewInput = false;
    errorState = false;
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

std::string CalculatorEngine::getDisplay() const {
    return errorState ? "Error" : currentInput;
}

std::string CalculatorEngine::formatNumber(double value) {
    if (std::fabs(value) < 1e-12) value = 0.0;

    std::ostringstream oss;
    oss << std::setprecision(15) << std::fixed << value;
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
