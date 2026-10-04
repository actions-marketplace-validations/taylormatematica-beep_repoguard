# 🛡️ RepoGuard

<p align="center">
  <img src="https://repository-images.githubusercontent.com/1373741489/0aea1473-d529-4f8b-8843-0e23f27ef138" alt="RepoGuard Banner" width="100%" />
</p>

<p align="center">
  <strong>The Architecture Guardian for AI-Assisted Codebases.</strong><br>
  Stop AI from turning your repository into architectural spaghetti across TypeScript, Python, and Golang in ~12ms.
</p>

<p align="center">
  <a href="https://www.producthunt.com/products/repoguard" target="_blank">
    <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=repoguard&theme=dark" alt="RepoGuard on Product Hunt" style="height: 40px;" height="40" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/taylormatematica-beep/repoguard/stargazers"><img src="https://img.shields.io/github/stars/taylormatematica-beep/repoguard?style=social" alt="GitHub Stars"></a>
  <a href="https://github.com/taylormatematica-beep/repoguard/actions/workflows/ci.yml"><img src="https://github.com/taylormatematica-beep/repoguard/actions/workflows/ci.yml/badge.svg" alt="CI & Architecture Guard"></a>
  <a href="https://www.npmjs.com/package/repoguard-rules"><img src="https://img.shields.io/npm/v/repoguard-rules?style=flat-square&color=00f2fe&label=npm%20v1.6.1" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/repoguard-rules"><img src="https://img.shields.io/npm/dm/repoguard-rules?style=flat-square&color=10b981&label=downloads" alt="downloads"></a>
  <a href="https://glama.ai/mcp/servers/64btyug8f1"><img src="https://glama.ai/mcp/servers/64btyug8f1/badge" alt="RepoGuard MCP server"></a>
  <a href="https://mcpservers.org/servers/taylormatematica-beep/repoguard"><img src="https://mcpservers.org/badge.svg" alt="Listed on mcpservers.org"></a>
  <a href="https://github.com/marketplace/actions/repoguard-architecture-audit"><img src="https://img.shields.io/badge/GitHub%20Marketplace-Action-blue?logo=github&style=flat-square" alt="Marketplace"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License"></a>
  <a href="https://taylormatematica-beep.github.io/repoguard/"><img src="https://img.shields.io/badge/playground-live%20demo-00f2fe?style=flat-square" alt="Live Playground"></a>
</p>

> 🎮 **Try it in your browser:** [RepoGuard Interactive Playground](https://taylormatematica-beep.github.io/repoguard/#playground) — Audit code snippets in real-time with zero install.

---

## ⚡ The Problem

AI coding assistants (**Cursor, GitHub Copilot, Claude Code, Windsurf**) write 300 lines of code in seconds. However, without strict repository guardrails, they frequently introduce **AI Code Rot**:

1. **Bypass Architectural Layers:** Run raw database queries (Prisma, Drizzle, SQLAlchemy, GORM) directly inside UI components or HTTP handlers.
2. **Reinvent Existing Helpers:** Write duplicate date/string utilities instead of importing from `/utils` or shared packages.
3. **Escape Type Safety & Error Handling:** Scatter `: any` in TypeScript or discard errors with `_ = err` in Go to pass quick compilation.
4. **Leak Sensitive Secrets:** Hardcode mock API keys or prefix private secrets with `NEXT_PUBLIC_`, bundling them into client-side JS.

RepoGuard acts as an automated architecture supervisor: it generates strict, customized `.cursorrules`, `CLAUDE.md`, and `.windsurfrules` context files, verifies pre-commit diffs in ~12ms, runs an MCP server for live agent consultation, and performs inline audits on every Pull Request.

---

## 🚀 Quickstart

Run directly in any repository (zero installation required):

```bash
npx repoguard-rules init
```

Or install globally:

```bash
npm install -g repoguard-rules
repoguard init
```

### What happens in 2 seconds:
- 🔍 **Auto-detects your tech stack** (Next.js, NestJS, Express, FastAPI, Django, Gin, Fiber, Prisma, GORM, etc.).
- 📝 **Generates tailored `.cursorrules`** (for Cursor AI).
- 🤖 **Generates a comprehensive `CLAUDE.md`** (for Claude Code).
- 🌊 **Generates `.windsurfrules`** (for Windsurf IDE).
- 🛡️ **Generates `.github/copilot-instructions.md`** (for GitHub Copilot).
- ⚙️ **Configures pre-commit guard hooks & CI workflow**.

---

## 🤖 Native MCP Server (Model Context Protocol)

RepoGuard v1.6.1 features a zero-dependency, JSON-RPC 2.0 stdio **MCP Server**. Connect it to **Cursor**, **Claude Desktop**, or any MCP-compatible coding client so your AI agent can audit code and verify guardrails autonomously:

### 1. Cursor Configuration (`~/.cursor/mcp.json` or `.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "repoguard": {
      "command": "npx",
      "args": ["-y", "repoguard-rules@1.6.1", "mcp"]
    }
  }
}
```

### 2. Claude Desktop Configuration (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "repoguard": {
      "command": "npx",
      "args": ["-y", "repoguard-rules@1.6.1", "mcp"]
    }
  }
}
```

### Available MCP Tools:
- **`repoguard_audit`**: Performs a comprehensive architectural audit of the project root and returns health metrics and grade (A+ to F).
- **`repoguard_get_rules`**: Retrieves all built-in guardrails for TypeScript, Python, and Go for LLM prompt context injection.
- **`repoguard_analyze_diff`**: Analyzes a code diff or snippet before writing to disk, catching violations before they happen.

---

## 🛠️ CLI Commands & Formats

| Command | Description |
| :--- | :--- |
| `npx repoguard-rules init` | Scans codebase and generates tailored AI context files. |
| `npx repoguard-rules audit` | Evaluates entire codebase and returns an **Architectural Health Score (A+ to F)**. |
| `npx repoguard-rules mcp` | Starts the Model Context Protocol stdio server for Claude & Cursor. |
| `npx repoguard-rules fix` | Interactively inspects violations and outputs refactoring plans. |
| `npx repoguard-rules audit --format=sarif` | Generates standard OASIS SARIF v2.1.0 for **GitHub Code Scanning** integration. |
| `npx repoguard-rules audit --format=json` | Outputs machine-readable JSON for custom CI/CD pipelines. |
| `npx repoguard-rules diff` | Audits uncommitted git diffs against architectural rules in real-time. |
| `npx repoguard-rules hook install` | Configures local `.git/hooks/pre-commit` to prevent rule breaches. |
| `npx repoguard-rules rules` | Displays all 12 built-in architectural rules and descriptions. |

### Ignoring Files & Folders (`.repoguardignore`)
Add a `.repoguardignore` file to your root directory to skip specific files or directories:

```text
# .repoguardignore
legacy/
migrations/
test/fixtures/
```

---

## 🛡️ Built-in Architectural Rules

| Rule ID | Category | Severity | Guardrail Enforced |
| :--- | :--- | :--- | :--- |
| **RULE-01** | Architecture | Error | Prohibits raw ORM/DB queries in UI components and Controllers (TS/JS). |
| **RULE-PY-01** | Architecture | Warning / Critical | Enforces FastAPI layer separation; forbids direct DB queries and raw commits (`db.commit()`) inside route handlers. |
| **RULE-GO-01** | Architecture | Warning / Critical | Enforces Clean Architecture in Go; prohibits raw database/GORM operations inside Gin, Fiber, or Echo HTTP handlers. |
| **RULE-GO-02** | Error Handling | Warning | Flags unchecked errors silenced via blank identifier (`_ = err`) in Go. |
| **RULE-02** | Security | Critical | Flags hardcoded secrets, private keys, and API tokens. |
| **RULE-09** | Security | Critical | Flags private secrets exposed via public prefixes (`NEXT_PUBLIC_*SECRET*`, `VITE_*SECRET*`). |
| **RULE-03** | Type Safety | Warning | Forbids lazy `: any` and `as any` escape hatches in TypeScript. |
| **RULE-04** | Code Quality | Info | Enforces structured logging instead of raw `console.log`. |
| **RULE-05** | Next.js / SSR | Error | Prevents hydration mismatch from browser globals (`window`/`localStorage`). |
| **RULE-06** | Security | Critical | Detects SQL injection hazards in raw query string interpolations. |
| **RULE-07** | API Design | Warning | Enforces schema validation (Zod/Pydantic) on incoming request payloads. |
| **RULE-08** | DRY Principle | Info | Prevents AI assistants from duplicating existing common utility helpers. |

---

## 🤖 GitHub Action & Security Integration

RepoGuard dogfoods its own architecture on every push. You can add continuous architectural enforcement to your CI/CD pipeline using the official Action:

```yaml
# .github/workflows/ci.yml
name: CI & Architecture Guard

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  audit:
    name: Unit Tests & Dogfood Audit
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Run Architecture & Stack Tests
        run: npm test

      - name: Dogfood Audit (RepoGuard on RepoGuard)
        run: node bin/repoguard.js audit --strict
```

### GitHub Code Scanning (SARIF v2.1.0):
```yaml
      - run: npx repoguard-rules audit --format=sarif > repoguard.sarif
      - uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: repoguard.sarif
```

---

## 💎 Plans & Enterprise Upgrades

RepoGuard is 100% free and open-source for public repositories and local development. For automated CI/CD PR enforcement, private teams, and custom architectural rule engines:

| Tier | Price | Ideal For | What's Included |
| :--- | :--- | :--- | :--- |
| **Open Source** | **$0** (Free Forever) | Solo builders & public repos | Unlimited local CLI scans, `.cursorrules`, `CLAUDE.md`, MCP Server, pre-commit hooks, all 12 built-in rules |
| **Developer Pro** | **$12** / month | Independent engineers & contractors | Unlimited private repositories, automated PR Review Bot, custom rules engine, secret leak detector |
| **Engineering Team** | **$39** / month | Startups & engineering orgs | Up to 5 devs, GitHub Org-wide CI/CD merge blocker, SOC2 architecture audit logs, Slack/Discord alerts |

👉 **[Subscribe to Developer Pro ($12/mo)](https://buy.stripe.com/dRm28tcsjcnC9On0kA6oo00)** • **[Upgrade Team ($39/mo)](https://buy.stripe.com/7sYbJ34ZRgDS1hR6IY6oo01)** • 🇧🇷 **[Pagar no PIX (R$ 67 à vista)](https://pay.kiwify.com.br/qeXPeY8)**

---

## 📈 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=taylormatematica-beep/repoguard&type=Date)](https://star-history.com/#taylormatematica-beep/repoguard&Date)

---

## 👥 Contributors & Community

Special thanks to the open source engineers contributing to RepoGuard:

- **[@taylormatematica-beep](https://github.com/taylormatematica-beep)** (Lead Maintainer & Author)
- **[@NihalPN](https://github.com/NihalPN)** — Authored `RULE-PY-01` & FastAPI architectural guardrails (PR #3)

## 🌟 Support & Community

- 🌐 **Documentation & Live Hub:** [https://taylormatematica-beep.github.io/repoguard/](https://taylormatematica-beep.github.io/repoguard/)
- 📦 **NPM Registry:** [https://www.npmjs.com/package/repoguard-rules](https://www.npmjs.com/package/repoguard-rules)
- 🐱 **Product Hunt:** [https://www.producthunt.com/products/repoguard](https://www.producthunt.com/products/repoguard)

If RepoGuard helps keep your AI coding clean, consider giving this repository a ⭐ **Star**!
