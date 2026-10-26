# Moving to the Mac mini

The repo covers the shareable part of the setup. This file covers the rest:
the private files that must never be committed here (the repo is public),
and the steps that a script can't do.

## 1. What the repo does not hold

| Item | Where it lives on the PC | Why it's not here |
| --- | --- | --- |
| API keys and tokens | `~/.claude.json` (MCP servers), `~/.claude/settings.json` (`env`) | secrets |
| `permissions` allow list | `~/.claude/settings.json` | holds a production database URL with its password |
| Memory | `~/.claude/projects/<key>/memory/` (48 folders on 2026-10-26) | personal and client notes |
| Session transcripts | `~/.claude/projects/<key>/*.jsonl` | large, private, not needed to work |
| Orca hooks | `~/.claude/settings.json` `hooks` | Orca adds them itself when it is installed |
| `statusLine` | `~/.claude/settings.json` | Windows command, rebuild it on the Mac |

## 2. Private bundle (do this on the PC)

1. Copy `claude-config/secrets.env.example` out of the repo first, to
   `$HOME\claude-secrets.env`, and fill in the real keys only in that copy
   (never in the repo file). The values are in
   `~/.claude.json` under `mcpServers` and in `settings.json` under `env`.
2. Put the secrets file and the memory folders in one encrypted archive.
   7-Zip is not installed on the PC yet (`winget install 7zip.7zip`):

   ```powershell
   & "C:\Program Files\7-Zip\7z.exe" a -p -mhe=on "$HOME\claude-private.7z" `
     "$HOME\claude-secrets.env" "$HOME\.claude\projects\*\memory"
   ```

   `-p` asks for a password, `-mhe=on` also hides the file names.
3. Copy `claude-private.7z` to the USB drive or the external NVMe. Google
   Drive is fine too because the archive is encrypted, but keep the password
   somewhere else.
4. Delete the plain `claude-secrets.env` from the PC after the archive is
   checked.

## 3. On the Mac

1. Run the restore from [README.md](README.md#restore-on-a-mac), with the
   secrets file from the bundle as `~/.claude-secrets.env` (`chmod 600`).
2. Extract the bundle (`brew install sevenzip`, then `7zz x claude-private.7z`).
3. Memory folders are keyed by the project path: every character that is
   not a letter or digit becomes `-`. On the PC `D:\2026 Company\surfacly`
   is `D--2026-Company-surfacly`. On the Mac the same project at
   `/Users/<you>/code/surfacly` gets a new key, so the old folder will not
   be found by itself. For each project you still use:
   - open one Claude session in the project on the Mac, so the new folder
     under `~/.claude/projects/` is created and you can read its exact name;
   - copy the old `memory/` folder into it.

   Scratch workspace and Temp keys (`...-scratch-workspaces-...`,
   `...-Temp-claude-...`) can be dropped; they belonged to one-off sessions.
4. Rebuild the `permissions` allow list by hand. Do not paste the database URL
   back in as a permission rule; keep it in the project `.env`.
5. Install the tools the hooks call:
   - `rtk` (the PC got it from winget; get the macOS build). Without it the
     rtk hook does nothing.
   - `python3` (`xcode-select --install`) for the graphify hooks.
   - Orca, if you still use it; it re-adds its own hooks.
6. Check: `claude mcp list`, `/mcp` for the OAuth servers, and `/context` in a
   new session to see that `CLAUDE.md` and the rules load.

The restore script has not been run on a Mac yet. Treat the first run as the
test and fix the script in this repo if a step fails.
