# Run from a normal Windows PowerShell terminal when Codex's sandbox blocks browser IPC.
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeRoot = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies'
$nodeBinary = Join-Path $runtimeRoot 'node/bin/node.exe'
$env:PLAYWRIGHT_MODULE = Join-Path $runtimeRoot 'node/node_modules/playwright'
Remove-Item Env:R1A_CDP -ErrorAction SilentlyContinue
Set-Location -LiteralPath $projectRoot
$serverProcess = $null
try {
  try { $null = Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:43830/' } catch {
    $serverProcess = Start-Process -FilePath $nodeBinary -ArgumentList @('scripts/serve.mjs','43830') -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru
    Start-Sleep -Seconds 2
  }
  & $nodeBinary scripts/r1a-browser.cjs
  if ($LASTEXITCODE -ne 0) { throw 'Browser checks failed; see terminal output.' }
  Write-Host 'Results: verification/local-r1a/browser-results.json'
} finally {
  if ($null -ne $serverProcess) { Stop-Process -Id $serverProcess.Id -ErrorAction SilentlyContinue }
}
