# CalcIOS

Starter calculator project with:

- `cpp/`: reusable C++ calculator engine and CLI demo.
- `web/`: iOS-inspired calculator UI built with HTML/CSS/JavaScript.

## Features

- Digits and decimal input
- `+`, `-`, `*`, `/`
- `=` evaluate
- `AC` clear all
- `C` clear current entry
- `+/-` sign toggle
- `%` percentage
- Backspace (`DEL` in CLI)

## Run Web UI

Open `web/index.html` in a browser.

## Build C++ Demo

```bash
cmake -S . -B build
cmake --build build
./build/calcios_cli
```

On Windows PowerShell:

```powershell
cmake -S . -B build
cmake --build build
.\build\Debug\calcios_cli.exe
```

## Example CLI Commands

- `digit 7`
- `decimal`
- `op +`
- `equals`
- `sign`
- `percent`
- `ce`
- `clear`
- `del`
- `quit`
