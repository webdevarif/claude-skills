# Copies the live Claude Code setup from this Windows PC into the repo.
# Run from anywhere:  pwsh -File scripts/backup-from-windows.ps1
# It never copies secrets, memory, transcripts or the permissions allow list.
#Requires -Version 7

param(
    [string]$Repo = (Split-Path -Parent $PSScriptRoot),
    [string]$ClaudeHome = (Join-Path $HOME '.claude')
)

$ErrorActionPreference = 'Stop'
$cfg = Join-Path $Repo 'claude-config'

# Skill folders that are local only and must not be published
$skipSkills = @('learned', 'synced')
# Heavy folders that live inside some skills (seo has a Python venv and browsers)
$skipDirs = @('.venv', 'venv', 'ms-playwright', 'node_modules', '__pycache__', '.git')

function Copy-Tree($src, $dst) {
    # robocopy follows junctions, so linked skills from ~/.agents get real files
    robocopy $src $dst /MIR /NFL /NDL /NJH /NJS /NP /XD @skipDirs /XF '*.pyc' '.DS_Store' | Out-Null
    if ($LASTEXITCODE -ge 8) { throw "robocopy failed for $src (exit $LASTEXITCODE)" }
    $global:LASTEXITCODE = 0
}

# 1. Top level config files
foreach ($f in 'CLAUDE.md', 'RTK.md') {
    Copy-Item (Join-Path $ClaudeHome $f) (Join-Path $cfg $f) -Force
}
Copy-Tree (Join-Path $ClaudeHome 'rules') (Join-Path $cfg 'rules')
Copy-Tree (Join-Path $ClaudeHome 'agents') (Join-Path $cfg 'agents')

New-Item -ItemType Directory -Force (Join-Path $cfg 'hooks') | Out-Null
Get-ChildItem (Join-Path $ClaudeHome 'hooks') -Filter '*.js' -File |
    ForEach-Object { Copy-Item $_.FullName (Join-Path $cfg "hooks/$($_.Name)") -Force }

# 2. Skills, one folder each at the repo root
$skills = Get-ChildItem (Join-Path $ClaudeHome 'skills') -Directory |
    Where-Object { $skipSkills -notcontains $_.Name }
foreach ($s in $skills) {
    Copy-Tree $s.FullName (Join-Path $Repo $s.Name)
}

# 3. settings.template.json: portable parts of settings.json only
$s = Get-Content (Join-Path $ClaudeHome 'settings.json') -Raw | ConvertFrom-Json -AsHashtable
$homeFwd = ($HOME -replace '\\', '/')
# both slash styles (and JSON-escaped backslashes), any letter case, so no
# real home path reaches the public repo
$homePattern = '(?i)' + [regex]::Escape($homeFwd).Replace('/', '[\\/]+')

$hooks = [ordered]@{}
foreach ($ev in $s.hooks.Keys) {
    $groups = @()
    foreach ($g in $s.hooks[$ev]) {
        # Orca hooks point at a Windows .exe, reinstall Orca on the Mac instead
        $kept = @($g.hooks | Where-Object { $_.command -notmatch 'orca' })
        if ($kept.Count -eq 0) { continue }
        foreach ($h in $kept) {
            $h.command = $h.command -replace $homePattern, '__HOME__'
            # rtk comes from winget here and from Homebrew on the Mac
            $h.command = $h.command -replace '"[^"]*rtk\.exe"', 'rtk'
        }
        $g.hooks = $kept
        $groups += $g
    }
    if ($groups.Count -gt 0) { $hooks[$ev] = $groups }
}

$env = [ordered]@{}
foreach ($k in $s.env.Keys) {
    $env[$k] = if ($k -match 'TOKEN|KEY|SECRET|PASSWORD') { '' } else { $s.env[$k] }
}

$template = [ordered]@{
    env                               = $env
    hooks                             = $hooks
    enabledPlugins                    = $s.enabledPlugins
    extraKnownMarketplaces            = $s.extraKnownMarketplaces
    effortLevel                       = $s.effortLevel
    modelSettings                     = $s.modelSettings
    tui                               = $s.tui
    theme                             = $s.theme
    skipDangerousModePermissionPrompt = $s.skipDangerousModePermissionPrompt
    switchModelsOnFlag                = $s.switchModelsOnFlag
    agentPushNotifEnabled             = $s.agentPushNotifEnabled
    autoMode                          = [ordered]@{ soft_deny = $s.autoMode.soft_deny }
}
$json = $template | ConvertTo-Json -Depth 20
if ($json -match $homePattern) { throw "settings.template.json would still contain $HOME, not writing it" }
$json | Set-Content (Join-Path $cfg 'settings.template.json') -Encoding utf8NoBOM

# 4. Warn about MCP servers missing from the hand kept template
$c = Get-Content (Join-Path $HOME '.claude.json') -Raw | ConvertFrom-Json -AsHashtable
$tpl = Get-Content (Join-Path $cfg 'mcp-servers.template.json') -Raw | ConvertFrom-Json -AsHashtable
$missing = @($c.mcpServers.Keys | Where-Object { -not $tpl.servers.ContainsKey($_) })
if ($missing.Count -gt 0) {
    Write-Warning "MCP servers not in mcp-servers.template.json: $($missing -join ', ')"
}

Write-Host "Synced $($skills.Count) skills, config, hooks and agents into $Repo"
