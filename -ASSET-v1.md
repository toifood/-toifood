ASSET LOG
INSTRUCTION FOR AI MODEL:

ALWAYS ADD NEW ASSET ENTRIES AT THE TOP, DIRECTLY BELOW THIS HEADER.

NEVER DELETE OR EDIT PREVIOUS ASSET ENTRIES.

REQUIRED FORMAT FOR EACH ASSET ENTRY:

## ASSET:{NAME OF ENVIRONMENT} {YYYY-MM-DD HH:MM} → {CONTENT}

####### <!-- ANCHOR MARKER - ADD ALL NEW ASSET ENTRIES DIRECTLY BELOW THIS LINE, NEVER DELETE OR EDIT PREVIOUS ASSET ENTRIES-->
## ASSET:toifood 2026-06-07 → pipeline architecture — Claude skill on Mac Mini self-hosted runner

**Flow:**
```
GitHub Actions schedule (daily 06:00)
  → would-update.yml (ts-back) — runs-on: [self-hosted, mac-mini]
    → checkout ts-back + -toifood
    → cp .toifood/.claude/commands/would-update.md ~/.claude/commands/
    → claude --dangerously-skip-permissions --print "/would-update ts-back"
        → gh api zipball ts-toifood-back@latest → /tmp/
        → read -MUST/ prompts + codebase context
        → generate 10 analyses (migrate/price/recovery/usage/instruction × ISSUE/ASSET)
        → prepend entries to category docs in ts-back
        → git commit + push
        → rm -rf /tmp/toifood-source*
```

**Mac Mini — what already exists:**
| Component | Status |
|---|---|
| `jayagent` account + PM2 | ✅ Running |
| cloudflared Cloudflare tunnel | ✅ Running |
| Friday 3am reboot + auto-recovery | ✅ Configured |
| Node.js (for npm/Claude Code) | ✅ Available |

**What needs to be built:**
| Step | Action |
|---|---|
| 1 | Register self-hosted runner: `toifood` org → Settings → Actions → Runners → New → macOS ARM64; install via `./config.sh` + `./svc.sh install` on Mac Mini (`jayagent`) |
| 2 | Install Claude Code: `npm install -g @anthropic-ai/claude-code`; auth: `claude` → OAuth → Claude Pro login |
| 3 | Update `would-update.md` skill: replace PowerShell with bash (`curl`, `unzip`, `/tmp/`, `$GITHUB_WORKSPACE`) |
| 4 | Update `would-update.yml`: replace `runs-on: ubuntu-latest` → `runs-on: [self-hosted, mac-mini]`; add skill copy step |

**Secrets required:**
| Secret | Scope | Status |
|---|---|---|
| `TOIFOOD_CROSS_REPO_TOKEN` | toifood org | ✅ Set |

No new secrets needed — Claude Pro auth and `gh` auth are stored on-machine under `jayagent`.

**Risk table:**
| Risk | Mitigation |
|---|---|
| Claude Pro auth expires | Job fails loudly → re-run `claude` interactively on Mac Mini |
| Mac Mini offline | Jobs queue → run when runner comes back online |
| Friday reboot vs job timing | Reboot 03:00, job 06:00 — no overlap |

**Comparison with toiflow:**
| | toiflow | toifood |
|---|---|---|
| LLM | Ollama `qwen2.5:7b` | Claude Pro (via CLI) |
| Runner | GitHub hosted | Self-hosted (Mac Mini) |
| LLM auth | `OLLAMA_SECRET` WAF header | Claude Pro OAuth on Mac Mini |
| Cost | Free | Free (Claude Pro already paid) |
## ASSET:toifood 2026-06-07 → Claude skill execution model confirmed

| Layer | Where it runs | Billing |
|---|---|---|
| LLM inference | Anthropic servers | Claude Pro (interactive) or API key (automated) |
| Tool execution (Bash, Read, Write) | Local machine | Free |
| GitHub Actions hosted runner | No local machine | Must use API key |
| GitHub Actions self-hosted runner | Local machine | Claude Pro ✅ |

Claude Pro covers LLM inference only in interactive CLI sessions. Any automated/headless trigger (GitHub Actions hosted) requires `ANTHROPIC_API_KEY`.
## ASSET:toifood 2026-06-07 → /would-update skill created — org-level reusable codebase analyser

File: `.claude/commands/would-update.md`

Invoked as `/would-update {ts-back|ts-front|ts-web}`. Derives source repo (`ts-toifood-{suffix}`) automatically.

Flow: `gh api zipball/latest` → `Expand-Archive` → read -MUST/ prompts + codebase context → generate 10 analyses → prepend to category docs → `git commit + push` → cleanup. Runs under Claude Pro, no API key required.
## ASSET:toifood 2026-06-07 → LLM backend confirmed — Anthropic API (`api.anthropic.com`)

Claude Code skills are CLI-only (Claude Pro subscription, interactive session). GitHub Actions cannot invoke them. Decision finalised: toifood pipeline uses `api.anthropic.com/v1/messages` with `ANTHROPIC_API_KEY` org secret. No Ollama dependency.
## ASSET:toifood 2026-06-07 → architecture — mirrors toiflow, scaled to 5 categories

Follows the same pattern as `toiflow` org. Key deltas:

| | toiflow | toifood |
|---|---|---|
| Reusable workflow LLM | Ollama via Cloudflare tunnel | Claude API (`api.anthropic.com`) |
| Auth secret | `OLLAMA_SECRET` (WAF header) | `ANTHROPIC_API_KEY` |
| Content jobs per repo | `issue` + `asset` (2) | 5 categories × issue/asset (10) |
| Job parallelism | Serialised (Ollama single-threaded) | Parallel (Claude API handles concurrency) |
| Source data | RSS / Gmail / Calendar | Codebase from source repo via `TOIFOOD_CROSS_REPO_TOKEN` |
| Output | `would/` files + CSV | `would/` files per category |

**Job flow (ts-back):** `fetch` → 10 parallel content jobs → `update`

**Same across both orgs:** org secrets via `secrets: inherit`, `would-read-md.js` + `would-update-content.js` pattern, `would/` output directory, ISSUE/ASSET doc format.

## ASSET:toifood 2026-06-07 → must-update-content.yml created — Claude API reusable workflow

- Calls `api.anthropic.com/v1/messages` with `x-api-key: ANTHROPIC_API_KEY`
- Inputs: `prompt` (required), `model` (default: `claude-haiku-4-5-20251001`)
- Output: `response` — Claude's text response
- Guard: exits 1 if response is empty or null
- Same interface as `toiflow/-toiflow/must-update-content.yml` (Ollama equivalent)
- `ANTHROPIC_API_KEY` required as `toifood` org secret
