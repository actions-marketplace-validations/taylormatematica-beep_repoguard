# 📜 RepoGuard Changelog

All notable changes to the **RepoGuard** architecture linter and context generator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.6.0] - 2026-10-03
### 🚀 Added
- **Golang Clean Architecture Engine:**
  - `RULE-GO-01`: Prohibits raw database queries and GORM mutations inside Gin, Fiber, or Echo HTTP handlers.
  - `RULE-GO-02`: Flags unchecked errors discarded via blank identifiers (`_ = err`).
  - Generates specialized `.cursorrules` and `CLAUDE.md` with context propagation and goroutine safety.
- **Python / FastAPI Expansion:**
  - Auto-detection of FastAPI, Django, Flask, SQLAlchemy, SQLModel, and Pydantic (`RULE-PY-01`).
- **Security Guardrail:**
  - `RULE-09`: Detects client-side secret exposure (`NEXT_PUBLIC_*` or `VITE_*` prefixes with private keys).
- **Enterprise CI/CD & Code Scanning:**
  - Native **OASIS SARIF v2.1.0** export via `npx repoguard audit --format=sarif` for GitHub Security / Code Scanning integration.
  - Machine-readable JSON export via `npx repoguard audit --format=json`.
  - `.repoguardignore` file support for custom directory exclusions.
- **CLI Commands:**
  - Added `npx repoguard fix` for interactive before/after architectural refactoring plans.
  - Added automatic viral badge injection into `README.md` on `init`.
- **Ecosystem:**
  - Officially published on the [GitHub Marketplace](https://github.com/marketplace/actions/repoguard-architecture-audit).
  - Launched in-browser interactive playground on the documentation hub.

---

## [1.5.2] - 2026-09-28
### 💎 Added
- Integrated Developer Pro ($12/mo) and Engineering Team ($39/mo) plan upgrades in CLI terminal footer and README.
- Added domestic PIX checkout support for Brazilian developer community.

---

## [1.5.0] - 2026-09-25
### 🐍 Added
- Merged community Pull Request #3 by [@NihalPN](https://github.com/NihalPN) introducing FastAPI route analysis.
- Integrated automated AST/diff line-number tracking for Python route decorators.

---

## [1.3.0] - 2026-09-19
### 🤖 Added
- Automated GitHub Actions Pull Request Review Commenter (`bin/commenter.js`).
- Dynamic Markdown scorecard with architectural health score (A+ to F) on every PR.

---

## [1.0.0] - 2026-09-18
### 🎉 Initial Release
- Core 8 architectural rules for TypeScript and JavaScript.
- Automated generation of `.cursorrules`, `CLAUDE.md`, and `.windsurfrules`.
- Git pre-commit hook installer (`npx repoguard hook install`).
- Published on NPM registry as `repoguard-rules`.
