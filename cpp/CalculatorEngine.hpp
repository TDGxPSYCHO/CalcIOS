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

    void memoryClear();
    void memoryRecall();
    void memoryStore();
    void memoryAdd();
    void memorySubtract();

    void setPi();
    void applyUnary(const std::string& fn);

    std::string getDisplay() const;
    double getMemoryValue() const;

private:
    std::string currentInput;
    double storedValue;
    char pendingOperator;
    bool waitingForNewInput;
    bool errorState;

    double memoryValue;
    char lastOperator;
    double lastRhs;
    bool hasLastRepeat;

    static std::string formatNumber(double value);
    static double parseInput(const std::string& input);
    static double applyOperation(double lhs, double rhs, char op);

    void setError();
};
