<#
.SYNOPSIS
  Archives the local-only X and Pinterest marketing assets and copies the
  archive to Google Drive.

.DESCRIPTION
  The generated marketing images (.png) are deliberately excluded from git:
  they are roughly 50 MB and the repository is public. That means the only
  copy is the one on this disk. This script makes a dated archive, verifies
  that the archive contains exactly the same files as the source folder, and
  copies it to Google Drive.

  Run it whenever you have produced a new batch of pins or tweets.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\scripts\backup-marketing-assets.ps1
#>

[CmdletBinding()]
param(
  # Where to keep the local archive. Defaults to a _backup folder next to the repo.
  [string]$LocalBackupDir = "",

  # Google Drive mount point. Leave empty to auto-detect.
  [string]$CloudDir = "",

  # Skip the Google Drive copy and only build the local archive.
  [switch]$SkipCloud
)

$ErrorActionPreference = "Stop"

# Resolved here rather than as a parameter default: $PSScriptRoot is not always
# populated while the parameter block is being bound.
$workspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
if ([string]::IsNullOrWhiteSpace($LocalBackupDir)) {
  $LocalBackupDir = Join-Path $workspaceRoot "_backup"
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$imagesDir = Join-Path $repoRoot "public\images"

if (-not (Test-Path -LiteralPath $imagesDir)) {
  throw "Cannot find the images folder at $imagesDir"
}

$stamp = Get-Date -Format "yyyy-MM-dd"
if (-not (Test-Path -LiteralPath $LocalBackupDir)) {
  New-Item -ItemType Directory -Path $LocalBackupDir | Out-Null
}
$zipPath = Join-Path $LocalBackupDir "MysticSage-images-$stamp.zip"

Write-Host "Source : $imagesDir"
Write-Host "Archive: $zipPath"

if (Test-Path -LiteralPath $zipPath) {
  Write-Host "Removing the previous archive for today so it can be rebuilt."
  Remove-Item -LiteralPath $zipPath -Force
}

$sourceFiles = @(Get-ChildItem -LiteralPath $imagesDir -Recurse -File)
Write-Host ("Packing {0} files..." -f $sourceFiles.Count)

$sw = [System.Diagnostics.Stopwatch]::StartNew()
Compress-Archive -LiteralPath $imagesDir -DestinationPath $zipPath -CompressionLevel Optimal
$sw.Stop()

Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
try {
  $expected = $sourceFiles | ForEach-Object { $_.FullName.Substring($imagesDir.Length + 1).Replace("\", "/") }
  $actual = $archive.Entries |
    Where-Object { $_.Name -ne "" } |
    ForEach-Object { $_.FullName.Replace("\", "/") -replace "^images/", "" }

  $expectedSet = [System.Collections.Generic.HashSet[string]]::new([string[]]$expected)
  $actualSet = [System.Collections.Generic.HashSet[string]]::new([string[]]$actual)
  $missing = @($expected | Where-Object { -not $actualSet.Contains($_) })
  $extra = @($actual | Where-Object { -not $expectedSet.Contains($_) })

  if ($missing.Count -gt 0 -or $extra.Count -gt 0) {
    throw ("Archive does not match the source. Missing: {0}, extra: {1}" -f $missing.Count, $extra.Count)
  }

  $sizeMb = [math]::Round((Get-Item -LiteralPath $zipPath).Length / 1MB, 1)
  Write-Host ("Verified: {0} files match, {1} MB, built in {2:N1}s" -f $actual.Count, $sizeMb, $sw.Elapsed.TotalSeconds)
}
finally {
  $archive.Dispose()
}

$hash = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash
Write-Host "SHA256: $hash"

if ($SkipCloud) {
  Write-Host "Cloud copy skipped."
  return
}

if ([string]::IsNullOrWhiteSpace($CloudDir)) {
  # Google Drive mounts as a drive whose root holds a "My Drive" style folder.
  foreach ($drive in (Get-PSDrive -PSProvider FileSystem)) {
    if ($drive.Name -eq "C") { continue }
    $candidate = Get-ChildItem -LiteralPath ($drive.Root) -Directory -Force -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -match "云端硬盘|My Drive" } |
      Select-Object -First 1
    if ($candidate) { $CloudDir = $candidate.FullName; break }
  }
}

if (-not $CloudDir) {
  Write-Warning "Google Drive was not found. The archive is still in $LocalBackupDir."
  return
}

$cloudTarget = Join-Path $CloudDir "MysticSage-backup"
if (-not (Test-Path -LiteralPath $cloudTarget)) {
  New-Item -ItemType Directory -Path $cloudTarget | Out-Null
}

$cloudZip = Join-Path $cloudTarget (Split-Path $zipPath -Leaf)
Copy-Item -LiteralPath $zipPath -Destination $cloudZip -Force

$cloudHash = (Get-FileHash -LiteralPath $cloudZip -Algorithm SHA256).Hash
if ($cloudHash -ne $hash) {
  throw "The cloud copy does not match the local archive."
}

Write-Host "Copied to Google Drive: $cloudZip"
Write-Host "Hashes match. Keep the Google Drive app running so the upload finishes."
