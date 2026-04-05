# Install super-aidlc as a Claude Code skill (Windows PowerShell)
# Usage: .\install.ps1 [-ProjectRoot <path>] [-Verify] [-Global]

param(
    [string]$ProjectRoot = ".",
    [switch]$Verify,
    [switch]$Global
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
# Resolve to the repo root (two levels up from adapters/claude-code/)
$ScriptDir = Resolve-Path (Join-Path $PSScriptRoot "..\..")

if ($Global) {
    $SkillDir = Join-Path $env:USERPROFILE ".claude\skills\super-aidlc"
} else {
    $SkillDir = Join-Path (Resolve-Path $ProjectRoot) ".claude\skills\super-aidlc"
}

# Read version
$Version = "unknown"
$VersionFile = Join-Path $ScriptDir "VERSION"
if (Test-Path $VersionFile) {
    $Version = (Get-Content $VersionFile -Raw).Trim()
}

# Verify mode
if ($Verify) {
    Write-Host "Verifying super-aidlc installation at $SkillDir..."
    $Healthy = $true

    $Links = @("SKILL.md", "phases", "agents", "guards", "rules", "extensions")
    foreach ($Link in $Links) {
        $Target = Join-Path $SkillDir $Link
        if (Test-Path $Target) {
            Write-Host "  OK  $Link"
        } else {
            Write-Host "  MISSING  $Link"
            $Healthy = $false
        }
    }

    if ($Healthy) {
        Write-Host "Installation healthy (v$Version)"
        exit 0
    } else {
        Write-Host "Installation has issues. Run install.ps1 to repair."
        exit 1
    }
}

# Verify source exists
if (-not (Test-Path (Join-Path $ScriptDir "SKILL.md"))) {
    Write-Error "Cannot find SKILL.md at $ScriptDir. Run from the super-aidlc repo."
    exit 1
}

# Create target directory
if (-not (Test-Path $SkillDir)) {
    New-Item -ItemType Directory -Path $SkillDir -Force | Out-Null
}

# Copy files (Windows doesn't support symlinks without admin, so we use junctions for dirs and copy for files)
Copy-Item -Path (Join-Path $ScriptDir "SKILL.md") -Destination (Join-Path $SkillDir "SKILL.md") -Force

$Dirs = @("phases", "agents", "guards", "rules", "extensions")
foreach ($Dir in $Dirs) {
    $Source = Join-Path $ScriptDir $Dir
    $Dest = Join-Path $SkillDir $Dir

    # Remove existing
    if (Test-Path $Dest) { Remove-Item $Dest -Recurse -Force }

    # Try junction first (no admin needed), fall back to copy
    try {
        cmd /c mklink /J "$Dest" "$Source" 2>&1 | Out-Null
    } catch {
        Copy-Item -Path $Source -Destination $Dest -Recurse -Force
    }
}

$Location = if ($Global) { "globally" } else { "" }
Write-Host "Installed super-aidlc v$Version $Location to $SkillDir"
Write-Host "Source: $ScriptDir"
Write-Host "Run 'git pull' in $ScriptDir to update."
Write-Host "Run '.\install.ps1 -Verify' to check installation health."
