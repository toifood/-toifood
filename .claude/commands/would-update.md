Analyse the source codebase and update all 10 category docs in the target repo.

## Arguments
`$ARGUMENTS` is the target repo name, e.g. `ts-back`, `ts-front`, `ts-web`.

## Derived values
- Source repo: `jayreck996/ts-toifood-{suffix}` where suffix = strip `ts-` from `$ARGUMENTS` (e.g. `ts-back` → `back` → `ts-toifood-back`)
- Target path: `$GITHUB_WORKSPACE` (set by GitHub Actions on the self-hosted runner)
- Categories: `migrate`, `price`, `recovery`, `usage`, `instruction`, `bug`, `analysis`

## Steps

### 1. Download and extract source repo

Run in bash:
```bash
suffix="${ARGUMENTS#ts-}"
zipPath="/tmp/toifood-source.zip"
extractPath="/tmp/toifood-source"
rm -rf "$extractPath"

# Find the branch with the most recent commit
latestBranch=""
latestDate=""
for branch in $(gh api "repos/jayreck996/ts-toifood-${suffix}/branches" --jq '.[].name'); do
  date=$(gh api "repos/jayreck996/ts-toifood-${suffix}/commits?sha=${branch}&per_page=1" --jq '.[0].commit.committer.date' 2>/dev/null)
  if [[ "$date" > "$latestDate" ]]; then
    latestDate="$date"
    latestBranch="$branch"
  fi
done
echo "Latest branch: $latestBranch ($latestDate)"

gh api "repos/jayreck996/ts-toifood-${suffix}/zipball/${latestBranch}" > "$zipPath"
unzip -q "$zipPath" -d "$extractPath"
root=$(find "$extractPath" -mindepth 1 -maxdepth 1 -type d | head -1)
echo "$root"
```

Note the `$root` path printed — all source file reads use this as the base.

### 2. Read codebase context

Read these files from `$root`:
- `README.md`
- `package.json`
- `prisma/schema.prisma` (skip if not present)
- List contents of `src/` directory tree (glob `src/**/*` from `$root`)

Hold this codebase context in mind for all 10 analyses.

### 3. For each of the 7 categories × issue/asset (14 total)

For each category in `migrate`, `price`, `recovery`, `usage`, `instruction`, `bug`, `analysis`:

**Embedded prompts for `bug` and `analysis` (no `-MUST/` file needed):**

- **bug ISSUE**: Analyze the codebase for overall and undiscovered bugs — hidden errors, edge cases, race conditions, unhandled exceptions, off-by-one errors, null dereferences, async pitfalls. Focus on non-obvious issues that could cause production failures.
- **bug ASSET**: Identify existing bug-prevention assets in the codebase — error handling, validation, defensive code, test coverage, logging. What is currently protecting against bugs and where are the gaps?
- **analysis ISSUE**: Provide an overall code quality and architecture analysis. Identify technical debt, architectural concerns, missing patterns, scalability issues, or areas that could degrade under load or growth.
- **analysis ASSET**: Summarize the overall codebase health — what is well-built, the tech stack, what is production-ready vs. in progress, and what the main engineering strengths are.

#### 3a. ISSUE analysis
1. For `migrate`, `price`, `recovery`, `usage`, `instruction`: read `$root/-MUST/{category}-ISSUE.md` as the instruction. For `bug` and `analysis`: use the embedded prompt above.
2. Using that instruction and the codebase context from step 2, generate a concise analysis
3. Format the entry:
   ```
   ## ISSUE:{category} {YYYY-MM-DD HH:MM} → {one-line summary}
   
   {analysis content}
   ```
4. Prepend the entry into `$GITHUB_WORKSPACE/would/{CATEGORY}-ISSUE-V1.md` directly below the `####### <!-- ANCHOR MARKER` line — never edit existing entries below it

#### 3b. ASSET analysis
1. For `migrate`, `price`, `recovery`, `usage`, `instruction`: read `$root/-MUST/{category}-ASSET.md` as the instruction. For `bug` and `analysis`: use the embedded prompt above.
2. Using that instruction and the codebase context from step 2, generate a concise analysis
3. Format the entry:
   ```
   ## ASSET:{category} {YYYY-MM-DD HH:MM} → {one-line summary}
   
   {analysis content}
   ```
4. Prepend the entry into `$GITHUB_WORKSPACE/would/{CATEGORY}-ASSET-V1.md` directly below the `####### <!-- ANCHOR MARKER` line — never edit existing entries below it

### 4. Commit and push

Run in bash from `$GITHUB_WORKSPACE`:
```bash
cd "$GITHUB_WORKSPACE"
git config user.name "would-update"
git config user.email "admin@toigroup.co.nz"
git add would/MIGRATE-ISSUE-V1.md would/MIGRATE-ASSET-V1.md would/PRICE-ISSUE-V1.md would/PRICE-ASSET-V1.md would/RECOVERY-ISSUE-V1.md would/RECOVERY-ASSET-V1.md would/USAGE-ISSUE-V1.md would/USAGE-ASSET-V1.md would/INSTRUCTION-ISSUE-V1.md would/INSTRUCTION-ASSET-V1.md would/BUG-ISSUE-V1.md would/BUG-ASSET-V1.md would/ANALYSIS-ISSUE-V1.md would/ANALYSIS-ASSET-V1.md
git commit -m "would-update: $(date '+%Y-%m-%d %H:%M') codebase analysis"
git push
```

### 5. Clean up
```bash
rm -rf /tmp/toifood-source.zip /tmp/toifood-source
```
