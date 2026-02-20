#include "CalculatorEngine.hpp"

#include <cassert>
#include <cmath>

int main() {
    {
        CalculatorEngine c;
        c.inputDigit('5');
        c.setOperator('+');
        c.inputDigit('2');
        c.evaluate();
        assert(c.getDisplay() == "7");
        c.evaluate();
        assert(c.getDisplay() == "9");
    }

    {
        CalculatorEngine c;
        c.inputDigit('8');
        c.memoryStore();
        c.clearAll();
        c.memoryRecall();
        assert(c.getDisplay() == "8");
        c.memoryAdd();
        c.memoryRecall();
        assert(c.getDisplay() == "16");
    }

    {
        CalculatorEngine c;
        c.inputDigit('3');
        c.inputDigit('0');
        c.applyUnary("sin");
        assert(std::fabs(std::stod(c.getDisplay()) - 0.5) < 1e-9);
    }

    {
        CalculatorEngine c;
        c.inputDigit('9');
        c.applyUnary("sqrt");
        assert(c.getDisplay() == "3");
        c.setOperator('^');
        c.inputDigit('2');
        c.evaluate();
        assert(c.getDisplay() == "9");
    }

    return 0;
}
