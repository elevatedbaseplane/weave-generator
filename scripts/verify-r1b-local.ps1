$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeRoot = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies'
$nodeBinary = Join-Path $runtimeRoot 'node/bin/node.exe'
$env:PLAYWRIGHT_MODULE = Join-Path $runtimeRoot 'node/node_modules/playwright'
Set-Location -LiteralPath $projectRoot
$serverProcess = $null
try {
  & $nodeBinary --test --test-isolation=none tests/*.test.mjs
  if ($LASTEXITCODE -ne 0) { throw 'R1B automated checks failed.' }
  & $nodeBinary --max-old-space-size=4096 docs/evidence/r1b-storage/optimization-equivalence.mjs verify
  if ($LASTEXITCODE -ne 0) { throw 'R1B optimization equivalence gate failed.' }
  & $nodeBinary scripts/r1b-worker-performance.mjs
  if ($LASTEXITCODE -ne 0) { throw 'R1B persistent worker performance gate failed. Browser verification is blocked.' }
  & $nodeBinary docs/evidence/r1b-storage/capacity-gate.mjs
  if ($LASTEXITCODE -ne 0) { throw 'R1B generated capacity gate failed.' }
  & $nodeBinary docs/evidence/r1b-storage/codec-capacity-proof.mjs
  if ($LASTEXITCODE -ne 0) { throw 'R1B synthetic maximum capacity proof failed.' }
  & $nodeBinary scripts/check.mjs
  if ($LASTEXITCODE -ne 0) { throw 'R1B static checks failed.' }
  try { $null = Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:43830/' } catch {
    $serverProcess = Start-Process -FilePath $nodeBinary -ArgumentList @('scripts/serve.mjs','43830') -WorkingDirectory $projectRoot -WindowStyle Hidden -PassThru
    Start-Sleep -Seconds 2
  }
  & $nodeBinary scripts/r1b-browser.cjs 2>&1 | Tee-Object -FilePath 'verification/local-r1b/host-browser.log'
  if ($LASTEXITCODE -ne 0) { throw 'R1B browser checks failed; see terminal output.' }
  Write-Host 'Results: verification/local-r1b/browser-results.json'
} finally {
  if ($null -ne $serverProcess) { Stop-Process -Id $serverProcess.Id -ErrorAction SilentlyContinue }
}
