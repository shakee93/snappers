# gq-headless

Next.js frontend for gqmobiles.lk. Talks to a WordPress + WPGraphQL backend at `api.gqmobiles.lk`.

## Deployment / Git workflow

**Direct pushes to `main` are not allowed.** Every change — including small fixes — goes through review.

1. **Branch** off `main` (or an active feature branch if stacking on in-flight work):
   ```
   git checkout -b <type>/<short-description>
   ```
   Branch-name prefixes in use: `feat/`, `fix/`, `perf/`, `ci/`, `chore/`, `docs/`.

2. **Commit** with a conventional-commit-style subject that matches the prefix, e.g. `perf(graphql): trim metaData keysIn`. Keep the subject under ~70 chars; put detail in the body if needed.

3. **Push** the feature branch:
   ```
   git push -u origin <branch>
   ```

4. **Open a PR** against `main` with `gh pr create`. CI (lint workflow) runs on PRs — wait for it to pass.

5. **Review.** A human reviewer approves before merge. Do not self-merge.

6. **Merge** to `main` only via the approved PR.

Never: `git push origin main`, `git push --force` to `main`, or skip the PR step.
