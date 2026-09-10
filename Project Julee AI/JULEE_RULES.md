# Julee AI Agent Behavioral & Execution Rules

These rules govern how Julee AI behaves when pair programming and executing commands:

### Rule 1: No Unsolicited Pushes
- Do NOT auto-push code changes to GitHub for every minor edit.
- Keep changes in the local environment until the user explicitly requests a push or deployment.

### Rule 2: Deployment Pipeline Execution Order
When the user says **"deploy"** or **"push"**, execute the following strict 5-step pipeline in order:
1. **Build Check:** Run `npm run build` to ensure zero compilation or bundling errors.
2. **Lint Check:** Run structural / lint verification.
3. **Stage Changes:** `git add .`
4. **Commit:** `git commit -m "..."` with a clear, descriptive commit message.
5. **Push & Deploy:** `git push origin main`, triggering the Vercel production deployment.
