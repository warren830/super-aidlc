# Uninstall super-aidlc from a Claude Code project (Windows PowerShell)
# Usage: .\uninstall.ps1 [-ProjectRoot <path>]

param(
    [string]$ProjectRoot = "."
)

$SkillDir = Join-Path (Resolve-Path $ProjectRoot) ".claude\skills\super-aidlc"

if (-not (Test-Path $SkillDir)) {
    Write-Host "super-aidlc is not installed in $ProjectRoot"
    exit 0
}

Remove-Item $SkillDir -Recurse -Force

Write-Host "Uninstalled super-aidlc from $ProjectRoot"
Write-Host "Note: aidlc-docs/ was NOT removed (contains your design docs and build logs)."
Write-Host "To remove artifacts too: Remove-Item -Recurse -Force (Join-Path '$ProjectRoot' 'aidlc-docs')"
