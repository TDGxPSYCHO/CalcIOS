param(
  [string]$BuildDir = "build-vs",
  [string]$Config = "Debug"
)

$ErrorActionPreference = "Stop"

$cmakeCmd = Get-Command cmake -ErrorAction SilentlyContinue
$ctestCmd = Get-Command ctest -ErrorAction SilentlyContinue
$cmake = $null
$ctest = $null

if ($cmakeCmd) { $cmake = $cmakeCmd.Source }
if ($ctestCmd) { $ctest = $ctestCmd.Source }

if (-not $cmake) {
  $candidate = "C:/Program Files/Microsoft Visual Studio/2022/Community/Common7/IDE/CommonExtensions/Microsoft/CMake/CMake/bin/cmake.exe"
  if (Test-Path $candidate) { $cmake = $candidate }
}

if (-not $ctest) {
  $candidate = "C:/Program Files/Microsoft Visual Studio/2022/Community/Common7/IDE/CommonExtensions/Microsoft/CMake/CMake/bin/ctest.exe"
  if (Test-Path $candidate) { $ctest = $candidate }
}

if (-not $cmake -or -not $ctest) {
  throw "Could not find cmake/ctest. Install CMake or Visual Studio C++ tools."
}

Write-Host "Using cmake: $cmake"
Write-Host "Using ctest: $ctest"

& $cmake -S . -B $BuildDir -G "Visual Studio 17 2022" -A x64
& $cmake --build $BuildDir --config $Config
& $ctest --test-dir $BuildDir -C $Config --output-on-failure
