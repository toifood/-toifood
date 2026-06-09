Analyse the source codebase and update all 10 category docs in the target repo.

## Arguments
`$ARGUMENTS` is the target repo name, e.g. `ts-back`, `ts-front`, `ts-web`.

## Derived values
- Source repo: `toifood-dev/ts-toifood-{suffix}` where suffix = strip `ts-` from `$ARGUMENTS` (e.g. `ts-back` → `back` → `ts-toifood-back`)
- Target path: `$GITHUB_WORKSPACE` (set by GitHub Actions on the self-hosted runner)
- Categories: `migrate`, `price`, `recovery`, `usage`, `instruction`, `bug`, `analysis`

## Steps

### 0. Compute quarter and prepare output dir

Run in bash:
```bash
QUARTER=$(node -e "
  const override = process.env.QUARTER_OVERRIDE;
  if (override) { console.log(override); process.exit(0); }
  const m = new Date().getMonth() + 1;
  console.log(new Date().getFullYear() + 'Q' + Math.ceil(m / 3));
")
echo "Target quarter: $QUARTER"
mkdir -p /tmp/would-results
```

Hold `$QUARTER` for all subsequent file paths. All analysis output goes to `/tmp/would-results/` — `would-update-content.js` handles writing to GitHub docs.

### 1. Download and extract source repo

Run in bash:
```bash
suffix="${ARGUMENTS#ts-}"
zipPath="/tmp/toifood-source.zip"
extractPath="/tmp/toifood-source"
rm -rf "$extractPath"

# Find the most recently created branch (first unique commit vs main)
latestBranch=""
latestDate=""
for branch in $(gh api "repos/toifood-dev/ts-toifood-${suffix}/branches" --jq '.[].name'); do
  [[ "$branch" == "main" ]] && continue
  created=$(gh api "repos/toifood-dev/ts-toifood-${suffix}/compare/main...${branch}" \
    --jq '.commits[-1].commit.committer.date' 2>/dev/null)
  if [[ "$created" > "$latestDate" ]]; then
    latestDate="$created"
    latestBranch="$branch"
  fi
done
echo "Newest branch: $latestBranch (created $latestDate)"

gh api "repos/toifood-dev/ts-toifood-${suffix}/zipball/${latestBranch}" > "$zipPath"
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
4. Write the formatted entry to `/tmp/would-results/{category}-issue.txt`

#### 3b. ASSET analysis
1. For `migrate`, `price`, `recovery`, `usage`, `instruction`: read `$root/-MUST/{category}-ASSET.md` as the instruction. For `bug` and `analysis`: use the embedded prompt above.
2. Using that instruction and the codebase context from step 2, generate a concise analysis
3. Format the entry:
   ```
   ## ASSET:{category} {YYYY-MM-DD HH:MM} → {one-line summary}
   
   {analysis content}
   ```
4. Write the formatted entry to `/tmp/would-results/{category}-asset.txt`

### 4. Clean up
```bash
rm -rf /tmp/toifood-source.zip /tmp/toifood-source
```
