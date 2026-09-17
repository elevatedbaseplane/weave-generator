$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeRoot = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies'
$nodeBinary = Join-Path $runtimeRoot 'node/bin/node.exe'
$env:PLAYWRIGHT_MODULE = Join-Path $runtimeRoot 'node/node_modules/playwright'
Set-Location -LiteralPath $projectRoot
$serverProcess = $null
try {
  Remove-Item -LiteralPath 'verification/local-r1b/browser-results.json' -Force -ErrorAction SilentlyContinue
  try { $null = Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:43830/' } catch {
    $serverProcess = Start-Process -FilePath $nodeBinary -ArgumentList @('scripts/serve.mjs','43830') -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru
    Start-Sleep -Seconds 2
  }
  & $nodeBinary scripts/r1b-browser.cjs 2>&1 | Tee-Object -FilePath 'verification/local-r1b/host-browser.log'
  if ($LASTEXITCODE -ne 0) { throw 'R1B browser checks failed; see verification/local-r1b/browser-failure-latest.json.' }
  Write-Host 'Results: verification/local-r1b/browser-results.json'
} finally {
  if ($null -ne $serverProcess) { Stop-Process -Id $serverProcess.Id -ErrorAction SilentlyContinue }
}
