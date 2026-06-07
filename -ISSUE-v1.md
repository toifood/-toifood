ISSUE LOG
INSTRUCTION FOR AI MODEL:

ALWAYS ADD NEW ISSUE ENTRIES AT THE TOP, DIRECTLY BELOW THIS HEADER.

NEVER DELETE OR EDIT PREVIOUS ISSUE ENTRIES.

REQUIRED FORMAT FOR EACH ISSUE ENTRY:

## ISSUE:{NAME OF ENVIRONMENT} {YYYY-MM-DD HH:MM} → {CONTENT}

####### <!-- ANCHOR MARKER - ADD ALL NEW ISSUE ENTRIES DIRECTLY BELOW THIS LINE, NEVER DELETE OR EDIT PREVIOUS ISSUE ENTRIES-->
## ISSUE:toifood 2026-06-07 → pipeline LLM decision — Claude skill via Mac Mini self-hosted runner

**Decision:** Use Claude Code CLI (Claude Pro) running on the Mac Mini server as a GitHub Actions self-hosted runner. GitHub Actions triggers on schedule → dispatches to Mac Mini → `claude --print "/would-update ts-back"` → writes to category docs → commits and pushes.

**Why not GitHub-hosted runner:** GitHub Actions hosted runners (`ubuntu-latest`) cannot use Claude Pro — they require `ANTHROPIC_API_KEY` (separate API billing). Claude Pro OAuth auth is machine-local.

**Why Mac Mini is valid:** Mac Mini is always-on infrastructure (PM2-managed, auto-restarts after Friday 3am reboot, `jayagent` auto-login). Not a "local machine" in the transient sense — it is a server.

**Why not Ollama (toiflow pattern):** Business goal is to align with Claude Pro subscription. Ollama remains available as fallback.

**Pending setup:**
1. GitHub Actions self-hosted runner installed on Mac Mini (`jayagent`) as LaunchAgent
2. Claude Code installed + Claude Pro OAuth auth on Mac Mini
3. `would-update.md` skill updated from Windows/PowerShell → macOS/bash
4. `would-update.yml` workflow updated to `runs-on: [self-hosted, mac-mini]`
## ISSUE:toifood 2026-06-07 → Claude skill tool execution requires local machine — GitHub Actions hosted runners incompatible

Claude skills split into two parts: LLM inference runs on Anthropic servers (covered by Claude Pro), tool execution (Bash, Read, Write, file I/O) runs on the local machine. GitHub Actions hosted runners (`ubuntu-latest`) have no connection to the local machine, so Claude's tool calls have nowhere to land.

**Options excluding local machine:**
- `anthropics/claude-code-action` — runs Claude Code in GitHub Actions but requires `ANTHROPIC_API_KEY` (API billing, not Claude Pro)
- Direct `api.anthropic.com` call — same billing
- Self-hosted runner — uses Claude Pro but requires local machine to be on

**Conclusion:** Excluding local machine = Anthropic API billing (~$1–3/month at Haiku rates). Decision pending.
## ISSUE:toifood 2026-06-07 → Claude skills are CLI-only — cannot be called from GitHub Actions

Confirmed: Claude skills run in the interactive Claude Code CLI session covered by Claude Pro. GitHub Actions cannot invoke them. Resolved by running the `/would-update` skill locally via wmux cron instead — no GitHub Actions LLM dependency, no `ANTHROPIC_API_KEY` needed.
## ISSUE:toifood 2026-06-07 → Claude skills (Claude Code) are CLI-only — not callable from GitHub Actions

Confirmed: skills run in the interactive CLI session, covered by Claude Pro subscription. Cannot be invoked from GitHub Actions workflows. Rules out using Claude Code/skills as the pipeline LLM backend — `api.anthropic.com` is used instead (`ANTHROPIC_API_KEY` org secret).
