# CalcIOS Behavior Spec (Shared)

This document defines behavior expected in both implementations (`web` and `cpp`) for parity.

## Core Arithmetic

1. Entering `5 + 2 =` yields `7`.
2. Pressing `=` again repeats the last operation and yields `9`.
3. `^` is exponent: `3 ^ 2 = 9`.
4. Division by zero results in `Error`.

## Editing

1. `AC` clears full state except memory value.
2. `C` clears only current entry.
3. `DEL` removes one digit; if one digit remains, display becomes `0`.

## Memory

1. `MS` stores current display into memory.
2. `MR` loads memory into current display.
3. `M+` adds current display to memory.
4. `M-` subtracts current display from memory.
5. `MC` resets memory to `0`.

## Scientific

1. `sqrt(9) = 3`.
2. `sin`, `cos`, `tan` are degree-based.
3. `ln(x)` and `log(x)` require `x > 0`, otherwise `Error`.
4. `1/x` requires `x != 0`, otherwise `Error`.
5. `pi` sets current input to PI.

## History (Web)

1. Each successful equals/unary evaluation is added to history.
2. Clicking a history item loads its value back into current display.

## Formatting

1. Display uses separators for readability when possible.
2. Very large/small magnitudes may use scientific notation.
