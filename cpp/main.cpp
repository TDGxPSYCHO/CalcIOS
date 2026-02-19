#include "CalculatorEngine.hpp"

#include <iostream>
#include <string>

int main() {
    CalculatorEngine calc;

    std::cout << "CalcIOS CLI demo\n";
    std::cout << "Commands: digit <0-9>, decimal, op <+|-|*|/>, equals, sign, percent, ce, clear, del, quit\n\n";

    std::string cmd;
    while (true) {
        std::cout << "[" << calc.getDisplay() << "] > ";
        if (!(std::cin >> cmd)) break;

        if (cmd == "digit") {
            char d;
            std::cin >> d;
            calc.inputDigit(d);
        } else if (cmd == "decimal") {
            calc.inputDecimal();
        } else if (cmd == "op") {
            char op;
            std::cin >> op;
            calc.setOperator(op);
        } else if (cmd == "equals") {
            calc.evaluate();
        } else if (cmd == "sign") {
            calc.toggleSign();
        } else if (cmd == "percent") {
            calc.percent();
        } else if (cmd == "ce") {
            calc.clearEntry();
        } else if (cmd == "clear") {
            calc.clearAll();
        } else if (cmd == "del") {
            calc.backspace();
        } else if (cmd == "quit") {
            break;
        } else {
            std::cout << "Unknown command\n";
        }
    }

    return 0;
}
