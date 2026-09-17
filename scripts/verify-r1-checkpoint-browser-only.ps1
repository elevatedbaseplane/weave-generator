$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeRoot = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies'
$nodeBinary = Join-Path $runtimeRoot 'node/bin/node.exe'
$env:PLAYWRIGHT_MODULE = Join-Path $runtimeRoot 'node/node_modules/playwright'
Set-Location -LiteralPath $projectRoot
$serverProcess = $null
try {
  try { $null = Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:43830/' -TimeoutSec 3 } catch {
    $serverProcess = Start-Process -FilePath $nodeBinary -ArgumentList @('scripts/serve.mjs','43830') -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru
    Start-Sleep -Seconds 2
  }
  $runStamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
  $log = "docs/evidence/r1-checkpoint-20260917/host-browser-$runStamp.log"
  & $nodeBinary scripts/r1-checkpoint-browser.cjs --resume-dense 2>&1 | Tee-Object -FilePath $log
  if ($LASTEXITCODE -ne 0) { throw "R1 checkpoint browser failed. Preserve the log: $log" }
  Write-Host 'PASS. Results are in docs/evidence/r1-checkpoint-20260917/browser-<timestamp>.json'
} finally {
  if ($null -ne $serverProcess) { Stop-Process -Id $serverProcess.Id -ErrorAction SilentlyContinue }
}
