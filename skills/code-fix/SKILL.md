---
name: code-fix
description: Apply review fixes for the `code-fix` command. Use when the user asks to run `code-fix`, read `.ai/branches/{branch-slug}/code-review.md` and `.ai/branches/{branch-slug}/plan.md`, implement corrections, create a new commit, and save a summary in `.ai/branches/{branch-slug}/code-fix.md`.
---

# Code Fix

## Goal

Implement corrections from `.ai/branches/{branch-slug}/code-review.md` and document completed fixes in `.ai/branches/{branch-slug}/code-fix.md`.

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
8. Plan and implement fixes for each applicable review finding ID.
9. Use `.ai/templates/code-fix.md` as the structural baseline for `.ai/branches/{branch-slug}/code-fix.md`.
10. Map every finding ID exactly once in `.ai/branches/{branch-slug}/code-fix.md` using the output format below.
11. Run relevant validation for modified areas.
12. Save `.ai/branches/{branch-slug}/code-fix.md`.
13. Ensure that tests and coding standards pass.
14. Create a new Conventional Commit for the fix set.

## Commit Rules

- Create a new commit, do not amend.
- Keep commit scope aligned with reviewed findings.
- Sign the commit.

## Output Format

- For each review finding ID, write exactly one mapping entry:
`- id: F001; status: <fixed|deferred|not-applicable>; summary: <what changed or why deferred>; evidence: <files and/or validation commands>`

## Finding ID Contract

- Every `F###` in `.ai/branches/{branch-slug}/code-review.md` must appear exactly once in `.ai/branches/{branch-slug}/code-fix.md`.
- Do not add IDs that are not present in `.ai/branches/{branch-slug}/code-review.md`.
- Preserve ID order from `.ai/branches/{branch-slug}/code-review.md`.

## Quality Bar

- Address root causes, not only symptoms.
- Keep fixes scoped to reviewed findings unless a required dependency appears.
- Ensure `.ai/branches/{branch-slug}/code-fix.md` maps fixes to findings.

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
