param(
  [int]$Port = 8080
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$webDir = Join-Path $root 'web'

if (-not (Test-Path $webDir)) {
  throw "Could not find web directory at: $webDir"
}

$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
  throw 'Python is required to run the local web server but was not found on PATH.'
}

$url = "http://127.0.0.1:$Port/"
Write-Host "Serving $webDir at $url"
Write-Host 'Press Ctrl+C to stop.'

Start-Process $url | Out-Null
python -m http.server $Port --directory $webDir
