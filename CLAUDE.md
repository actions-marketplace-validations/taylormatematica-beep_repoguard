# CLAUDE.md — Architecture & Context Guide
> Enforced by RepoGuard. Read this before proposing any changes.

## Project Overview
- **Framework:** Node.js / Universal
- **Language:** JavaScript
- **Data Layer:** None detected
- **Source Root:** ./

## Core Rules for AI Agents:
1. **Strict Layer Separation:** Handlers/UI -> Service Layer -> Repository. Never bypass directly to the database.
2. **Explicit Error Handling:** Never discard errors or use blind try/except passes.
3. **Reuse Existing Utilities:** Do not invent new formatters or date helpers if already available in the codebase.
4. **Zero Secrets in Code:** Never write API keys or tokens in code; use environment variables.
5. **Git Commits:** Follow Conventional Commits format (`feat:`, `fix:`, `refactor:`, `docs:`).
