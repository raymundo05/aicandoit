---
name: code-fix-amend
description: Apply review fixes for the `code-fix-amend` command. Use when the user asks to run `code-fix-amend`, follow the `code-fix` workflow, but amend the previous commit instead of creating a new one.
---

# Code Fix Amend

## Goal

Apply `.ai/branches/{branch-slug}/code-review.md` corrections and amend the latest commit with the fix changes.

## Branch Scope

1. Resolve `branch-slug` from the active git branch:
   - Run `git rev-parse --abbrev-ref HEAD`.
   - If the result is `HEAD`, use `detached-$(git rev-parse --short HEAD)`.
   - Replace `/` with `_` in the final value.
2. Use `.ai/branches/{branch-slug}` as the artifact root for this skill.
3. Do not write fix output to top-level `.ai/code-fix.md`.

## Workflow

1. Ensure .ai/ and .ai/templates/ exist in this order before any .ai/ template lookup.
2. If the required template file does not exist, create it using the exact template content in Failure Handling.
3. Ensure .ai/branches/{branch-slug} exists before reading or writing branch artifacts.
4. Read `.ai/branches/{branch-slug}/code-review.md`.
5. If `.ai/branches/{branch-slug}/code-review.md` is exactly `ALL GOOD`, respond that all is good and stop.
6. Read `.ai/branches/{branch-slug}/plan.md` for intended scope.
7. Extract all finding IDs from `.ai/branches/{branch-slug}/code-review.md` (`F001`, `F002`, ...).
8. Implement fixes for review findings by ID.
9. Use `.ai/templates/code-fix.md` as the structural baseline for `.ai/branches/{branch-slug}/code-fix.md`.
10. Map every finding ID exactly once in `.ai/branches/{branch-slug}/code-fix.md` using the output format below.
11. Run relevant validation for modified areas.
12. Save `.ai/branches/{branch-slug}/code-fix.md`.
13. Amend the previous commit instead of creating a new commit.

## Commit Rules

- Amend only the latest commit in scope.
- Keep amended commit message accurate and concise.
- Sign the amended commit.

## Output Format

- For each review finding ID, write exactly one mapping entry:
`- id: F001; status: <fixed|deferred|not-applicable>; summary: <what changed or why deferred>; evidence: <files and/or validation commands>`

## Finding ID Contract

- Every `F###` in `.ai/branches/{branch-slug}/code-review.md` must appear exactly once in `.ai/branches/{branch-slug}/code-fix.md`.
- Do not add IDs that are not present in `.ai/branches/{branch-slug}/code-review.md`.
- Preserve ID order from `.ai/branches/{branch-slug}/code-review.md`.

## Quality Bar

- Keep amended commit message accurate and concise.
- Confirm all addressed findings are reflected in `.ai/branches/{branch-slug}/code-fix.md`.
- Avoid unrelated changes in the amend operation.

## Failure Handling

- If `.ai/branches/{branch-slug}/code-review.md` has findings without `F###` IDs, stop and normalize review output first.
- If `.ai/` does not exist, create it.
- If `.ai/templates/` does not exist, create it.
- If .ai/templates/code-fix.md does not exist, create it with exactly this content:

```md
# CODE FIX

- id: F001; status: <fixed|deferred|not-applicable>; summary: <what changed or why deferred>; evidence: <files and/or validation commands>
```

- If .ai/branches/{branch-slug} does not exist, create it.
- If `.ai/branches/{branch-slug}/code-review.md` is missing but legacy `.ai/code-review.md` exists, copy legacy content once before applying fixes.
