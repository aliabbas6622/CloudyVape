## 2025-05-14 - Focus on single optimization and avoid lockfile pollution
**Learning:** It's important to strictly follow the "ONE small improvement" constraint to keep PRs focused and easy to review. Also, avoid committing newly generated lockfiles if they are not explicitly required by a change in package.json.
**Action:** Always double-check that only one optimization is implemented and ensure that no unnecessary files like pnpm-lock.yaml are included in the PR if they were generated as a side effect of environment setup.
