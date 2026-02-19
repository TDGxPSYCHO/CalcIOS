#pragma once

#include <string>

class CalculatorEngine {
public:
    CalculatorEngine();

    void inputDigit(char digit);
    void inputDecimal();
    void setOperator(char op);
    void evaluate();
    void clearAll();
    void clearEntry();
    void backspace();
    void toggleSign();
    void percent();

    std::string getDisplay() const;

private:
    std::string currentInput;
    double storedValue;
    char pendingOperator;
    bool waitingForNewInput;
    bool errorState;

    static std::string formatNumber(double value);
    static double parseInput(const std::string& input);
    static double applyOperation(double lhs, double rhs, char op);

    void setError();
};
