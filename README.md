# CalcIOS

A calculator project with two implementations:

- `cpp/`: reusable C++ calculator engine with CLI demo and tests.
- `web/`: iOS-inspired calculator UI with scientific mode, history, graphing, and PWA support.

## What Was Added

- Memory keys: `MC`, `MR`, `M+`, `M-`, `MS`
- History panel with click-to-reuse values
- Scientific mode: `sin`, `cos`, `tan`, `log`, `ln`, `x^y`, `sqrt`, `pi`, `1/x`
- Theme switcher: `Aurora`, `Daylight`, `Midnight`
- Better number formatting with separators and scientific notation fallback
- UX polish: long-press `DEL`, haptics toggle, sound toggle, richer keyboard shortcuts
- Graph panel for `f(x)` plotting
- PWA install/offline support (`manifest.json`, `service-worker.js`, icons in `web/icons/`)
- Automated tests for web core and C++ engine
- Shared parity spec in `spec/behavior.md`

## Web Shortcuts

- Digits, `.`, `+ - * / ^`, `Enter`, `=`
- `Backspace`: delete
- `Delete`: clear entry
- `Escape`: clear all
- `c`: smart clear (`C`/`AC`)
- `n`: sign toggle
- `p`: percent
- `s`: sin, `o`: cos, `t`: tan, `l`: log, `r`: sqrt

## Run Web UI

Use a local server (service worker requires HTTP, not direct file open):

```powershell
./run-web.ps1
```

Or manually:

```powershell
python -m http.server 8080 --directory web
```

Then open `http://127.0.0.1:8080/`.

## Web Tests

```powershell
npm run test:web
```

## Build C++ Demo and Tests

Preferred (auto-detects Visual Studio bundled CMake/CTest if not on PATH):

```powershell
./run-cpp-tests.ps1
```

Manual:

```powershell
cmake -S . -B build
cmake --build build
ctest --test-dir build --output-on-failure
```

Run CLI (Visual Studio generator):

```powershell
.\build-vs\Debug\calcios_cli.exe
```

## CLI Commands

- `digit <0-9>`
- `decimal`
- `op <+|-|*|/|^>`
- `equals`
- `sign`
- `percent`
- `ce`
- `clear`
- `del`
- `pi`
- `unary <sqrt|sin|cos|tan|ln|log|inv>`
- `mc`, `mr`, `ms`, `m+`, `m-`
- `quit`
