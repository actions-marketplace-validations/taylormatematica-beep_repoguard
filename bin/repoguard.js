#!/usr/bin/env node

/**
 * RepoGuard CLI v1.6.0 — The Architecture Guardian for AI-Assisted Codebases
 * Zero-dependency standalone CLI tool
 * Multi-Language Support: TypeScript/JavaScript, Python, Golang
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const {
  analyzeDiff,
  scanDirectory,
  calculateHealthScore,
  formatGitHubComment,
  formatSARIF,
  formatJSON,
  ARCHITECTURAL_RULES
} = require('./analyzer');
const { runGitHubActionPRReview, generatePRReviewMarkdown } = require('./commenter');

// ANSI Colors for Terminal Output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m"
};

function logBanner() {
  console.log(`
${colors.cyan}${colors.bright}  ____                     ____                     _ 
 |  _ \\ ___ _ __   ___    / ___|_   _  __ _ _ __ __| |
 | |_) / _ \\ '_ \\ / _ \\  | |  _| | | |/ _\` | '__/ _\` |
 |  _ <  __/ |_) | (_) | | |_| | |_| | (_| | | | (_| |
 |_| \\_\\___| .__/ \\___/   \\____|\\__,_|\\__,_|_|  \\__,_|
           |_|                                        ${colors.reset}
  ${colors.dim}The Architecture Guardian for AI-assisted code • v1.6.0${colors.reset}
`);
}

function detectProjectStack(targetDir) {
  const stack = {
    framework: 'Generic Node / JS',
    hasTs: false,
    hasPython: false,
    hasGo: false,
    rulesPath: '.cursorrules',
    claudePath: 'CLAUDE.md',
    windsurfPath: '.windsurfrules'
  };

  try {
    const files = fs.readdirSync(targetDir);
    
    // Detect Languages
    stack.hasTs = files.some(f => f.endsWith('.ts') || f.endsWith('.tsx') || f === 'tsconfig.json');
    stack.hasPython = files.some(f => f.endsWith('.py') || f === 'requirements.txt' || f === 'pyproject.toml' || f === 'Pipfile');
    stack.hasGo = files.some(f => f.endsWith('.go') || f === 'go.mod');

    if (files.includes('package.json')) {
      const pkg = JSON.parse(fs.readFileSync(path.join(targetDir, 'package.json'), 'utf8'));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      
      if (deps['next']) stack.framework = 'Next.js (App Router / Fullstack)';
      else if (deps['react']) stack.framework = 'React (SPA / Vite)';
      else if (deps['express'] || deps['fastify'] || deps['koa']) stack.framework = 'Node.js Backend (Express/Fastify)';
      else if (deps['nest'] || deps['@nestjs/core']) stack.framework = 'NestJS (Modular Clean Architecture)';
      else if (deps['vue'] || deps['nuxt']) stack.framework = 'Vue / Nuxt.js';
    } else if (stack.hasPython) {
      stack.framework = 'Python Architecture (FastAPI / Django / Flask)';
    } else if (stack.hasGo) {
      stack.framework = 'Golang Clean Architecture (Standard Go Layout)';
    }
  } catch (err) {
    // Fallback default
  }

  return stack;
}

function generateCursorRules(stack) {
  let langGuidelines = `
# ─── TYPESCRIPT & FRONTEND GUIDELINES ───────────────────────────────────────
- Never import database clients, ORM models, or backend repositories directly in frontend components or controllers.
- Route all database interactions through dedicated domain services (/services/) or repository abstractions (/repositories/).
- NEVER use 'any'. Always define strict TypeScript interfaces or use 'unknown' with type narrowing.
- Wrap all async operations in comprehensive try/catch blocks with contextual error handling.
- Disallow direct access to browser globals (window, localStorage) in Server Components (Next.js SSR).
- Strictly sanitize all dynamic query inputs to prevent SQL/NoSQL injection vulnerabilities.
`;

  if (stack.hasPython) {
    langGuidelines += `
# ─── PYTHON ARCHITECTURE GUIDELINES ──────────────────────────────────────────
- Follow Clean Architecture: Routers -> Service / UseCase Layer -> Repository / DB Layer.
- No direct database sessions or raw queries inside FastAPI route handlers (enforce RULE-PY-01).
- Enforce strict Pydantic v2 schemas for all request payload validations.
- Do not catch generic 'Exception' without re-raising or logging with structured contextual data.
- Keep business logic isolated from framework-specific HTTP adapters.
`;
  }

  if (stack.hasGo) {
    langGuidelines += `
# ─── GOLANG CLEAN ARCHITECTURE GUIDELINES ────────────────────────────────────
- Respect Standard Go Project Layout: /cmd, /internal, /pkg.
- No direct SQL queries or ORM calls inside HTTP handler functions (enforce RULE-GO-01).
- NEVER ignore or discard errors using blank identifiers ('_ = err') (enforce RULE-GO-02).
- Propagate errors with context using fmt.Errorf("operation failed: %w", err).
- Pass context.Context as the first argument in all I/O and database operations.
`;
  }

  return `# RepoGuard Architectural Guardrails for AI Coding Agents (.cursorrules)
# Framework: ${stack.framework}
# Enforced via RepoGuard CLI (https://taylormatematica-beep.github.io/repoguard/)

You are an expert Principal Software Architect. When generating, refactoring, or modifying code in this codebase, you must strictly abide by these non-negotiable architectural boundaries:

${langGuidelines}
# ─── SECURITY & SECRETS HYGIENE ─────────────────────────────────────────────
- NEVER commit or hardcode credentials, private keys, API secrets, or database URLs.
- Always load configuration from verified environment variables.
- NEVER expose backend-only secrets to client bundles via NEXT_PUBLIC_ or VITE_ prefixes.

# ─── PRODUCTION LOGGING & HYGIENE ───────────────────────────────────────────
- Do not leave raw console.log / print statements in production code. Use the centralized structured logger.
- When AI modifies code, run 'npx repoguard audit' or 'npx repoguard diff' before committing.
`;
}

function generateClaudeMd(stack) {
  let langCommands = `- Run TypeScript linter: \`npx tsc --noEmit\``;
  if (stack.hasPython) langCommands += `\n- Run Python type checks: \`mypy .\` or \`ruff check .\``;
  if (stack.hasGo) langCommands += `\n- Run Go verification: \`go vet ./...\` and \`go test ./...\``;

  return `# CLAUDE.md — Architecture & Engineering Standards
# Detected Framework: ${stack.framework}

## Architectural Principles
This codebase strictly enforces Clean Architecture boundaries. All AI-assisted changes must adhere to the rules below:

1. **Layer Separation**: UI components and controllers MUST NOT directly execute database queries or call ORMs. All mutations and business operations go through the Service / Repository layer.
2. **Multi-Language Standards**:
   - TypeScript: Strict types only. Zero tolerance for \`any\`.
   - Python: Clean separation between FastAPI routers and persistence layers.
   - Golang: Explicit error handling. Never silence errors via \`_ = err\`.
3. **Security First**: Zero hardcoded secrets, API keys, or raw SQL string interpolations.
4. **Validation**: Every external boundary (HTTP, Webhooks) must parse payloads via schema validators before business execution.

## Essential Commands
- Run architecture audit: \`npx repoguard audit\`
- Check uncommitted changes: \`npx repoguard diff\`
- Run SARIF security export: \`npx repoguard audit --format=sarif\`
${langCommands}
`;
}

function generateWindsurfRules(stack) {
  return generateCursorRules(stack);
}

function generatePreCommitHook() {
  return `#!/bin/sh
# RepoGuard Pre-Commit Hook — Protect against AI Architectural Drift
# Generated automatically by RepoGuard CLI

echo "🛡️  RepoGuard: Auditing uncommitted changes for architectural violations..."

npx repoguard diff --strict

EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo ""
  echo "❌ RepoGuard blocked this commit due to critical architectural violations."
  echo "💡 Run 'npx repoguard fix' or fix the issues listed above to proceed."
  echo "💡 To bypass temporarily (not recommended): git commit --no-verify"
  exit 1
fi

echo "✅ RepoGuard: Architecture checks passed! Proceeding with commit."
exit 0
`;
}

function generateGitHubActionWorkflow() {
  return `name: RepoGuard Architectural CI

on:
  pull_request:
    branches: [ main, master, develop ]

jobs:
  repoguard-review:
    name: RepoGuard Architecture & AI Drift Guard
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run RepoGuard Architecture Review
        uses: taylormatematica-beep/repoguard@main
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          strict_mode: true
`;
}

// Parse arguments
const args = process.argv.slice(2);
const command = args[0] || 'help';

// MCP Mode Hook: If invoked with 'mcp' OR if piped via stdio (Glama mcp-proxy / Claude / Cursor / non-TTY)
if (command === 'mcp' || (!args[0] && !process.stdin.isTTY)) {
  const { startMCPServer } = require('./mcp');
  startMCPServer();
  return;
}

// GitHub Action Runner Check
if (process.env.GITHUB_ACTIONS === 'true' && (!args[0] || args[0] === 'ci' || args[0] === 'action')) {
  runGitHubActionPRReview().catch(err => {
    console.error('RepoGuard CI Error:', err.message);
    process.exit(1);
  });
  return;
}

const isJsonFormat = args.includes('--format=json');
const isSarifFormat = args.includes('--format=sarif');
const isStrict = args.includes('--strict');

if (!isJsonFormat && !isSarifFormat) {
  logBanner();
}

const targetDir = process.cwd();

if (command === 'init') {
  console.log(`${colors.cyan}🔍 Scanning repository architecture...${colors.reset}`);
  
  const stack = detectProjectStack(targetDir);
  console.log(`  ${colors.green}✓${colors.reset} Framework: ${colors.bright}${stack.framework}${colors.reset}`);
  console.log(`  ${colors.green}✓${colors.reset} Languages: TypeScript: ${stack.hasTs ? 'Yes' : 'No'} | Python: ${stack.hasPython ? 'Yes' : 'No'} | Go: ${stack.hasGo ? 'Yes' : 'No'}\n`);

  // Write .cursorrules
  const cursorContent = generateCursorRules(stack);
  fs.writeFileSync(path.join(targetDir, stack.rulesPath), cursorContent, 'utf8');
  console.log(`${colors.green}✅ Generated ${stack.rulesPath}${colors.reset} with multi-language architectural guardrails`);

  // Write CLAUDE.md
  const claudeContent = generateClaudeMd(stack);
  fs.writeFileSync(path.join(targetDir, stack.claudePath), claudeContent, 'utf8');
  console.log(`${colors.green}✅ Generated ${stack.claudePath}${colors.reset} with engineering standards & validation commands`);

  // Write .windsurfrules
  const windsurfContent = generateWindsurfRules(stack);
  fs.writeFileSync(path.join(targetDir, stack.windsurfPath), windsurfContent, 'utf8');
  console.log(`${colors.green}✅ Generated ${stack.windsurfPath}${colors.reset} for Windsurf Cascade IDE`);

  console.log(`\n${colors.bright}🎯 Setup Complete!${colors.reset} AI agents in Cursor, Claude Code & Windsurf will now respect your architecture.`);
  console.log(`💡 Run ${colors.cyan}npx repoguard audit${colors.reset} to verify your codebase health score.\n`);

} else if (command === 'audit') {
  const startTime = Date.now();
  const files = scanDirectory(targetDir);
  let allViolations = [];

  for (const file of files) {
    const relativePath = path.relative(targetDir, file);
    try {
      const content = fs.readFileSync(file, 'utf8');
      const fileViolations = analyzeDiff(content, relativePath);
      allViolations = allViolations.concat(fileViolations);
    } catch (err) {
      // Skip unreadable files
    }
  }

  const durationMs = Date.now() - startTime;
  const health = calculateHealthScore(allViolations, files.length);

  if (isSarifFormat) {
    console.log(formatSARIF(allViolations, files.length));
    process.exit(allViolations.some(v => v.severity === 'critical') && isStrict ? 1 : 0);
  } else if (isJsonFormat) {
    console.log(formatJSON(allViolations, files.length, durationMs, health));
    process.exit(allViolations.some(v => v.severity === 'critical') && isStrict ? 1 : 0);
  }

  // Terminal Human-Readable Report
  console.log(`${colors.dim}Auditing repository:${colors.reset} ${targetDir}`);
  console.log(`${colors.dim}Files scanned:${colors.reset} ${files.length} | ${colors.dim}Duration:${colors.reset} ${durationMs}ms\n`);

  console.log(`┌─────────────────────────────────────────────────────────────┐`);
  console.log(`│  Architectural Health Score: ${colors.bright}${health.score} (${health.grade})${colors.reset}                       │`);
  console.log(`│  ${health.summary.padEnd(58)} │`);
  console.log(`└─────────────────────────────────────────────────────────────┘\n`);

  if (allViolations.length === 0) {
    console.log(`${colors.green}✨ No architectural violations found! Your codebase is pristine.${colors.reset}\n`);
    process.exit(0);
  }

  console.log(`${colors.bright}Violations Detected (${allViolations.length}):${colors.reset}\n`);

  for (const v of allViolations) {
    const sevColor = v.severity === 'critical' ? colors.red : v.severity === 'error' ? colors.yellow : colors.cyan;
    console.log(`  ${sevColor}[${v.ruleId}] ${v.severity.toUpperCase()}${colors.reset}: ${v.message}`);
    console.log(`  ${colors.dim}File:${colors.reset} ${v.filename}:${v.lineNumber}`);
    console.log(`  ${colors.dim}Code:${colors.reset} ${colors.yellow}${v.codeSnippet}${colors.reset}`);
    if (v.suggestion) {
      console.log(`  ${colors.green}💡 Suggestion:${colors.reset} ${v.suggestion}`);
    }
    console.log(``);
  }

  if (isStrict && allViolations.some(v => v.severity === 'critical')) {
    console.error(`${colors.red}❌ Strict mode enabled: Critical architectural violations found.${colors.reset}`);
    process.exit(1);
  }

} else if (command === 'diff') {
  let gitDiffOutput = '';
  try {
    gitDiffOutput = execSync('git diff HEAD', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  } catch (err) {
    try {
      gitDiffOutput = execSync('git diff', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    } catch (_) {}
  }

  if (!gitDiffOutput || gitDiffOutput.trim().length === 0) {
    console.log(`${colors.green}✨ Clean working tree! No uncommitted git diffs detected.${colors.reset}\n`);
    process.exit(0);
  }

  console.log(`${colors.cyan}🔍 Auditing uncommitted git changes...${colors.reset}\n`);
  
  // Parse diff files
  const diffSections = gitDiffOutput.split(/^diff --git /m).filter(Boolean);
  let diffViolations = [];

  for (const section of diffSections) {
    const lines = section.split('\n');
    const match = lines[0].match(/b\/(.+)$/);
    if (!match) continue;
    const filename = match[1];

    const addedLines = lines
      .filter(l => l.startsWith('+') && !l.startsWith('+++'))
      .map(l => l.slice(1))
      .join('\n');

    const v = analyzeDiff(addedLines, filename);
    diffViolations = diffViolations.concat(v);
  }

  if (diffViolations.length === 0) {
    console.log(`${colors.green}✅ All uncommitted changes adhere to architectural guardrails!${colors.reset}\n`);
    process.exit(0);
  }

  console.log(`${colors.bright}Found ${diffViolations.length} violation(s) in uncommitted changes:${colors.reset}\n`);
  for (const v of diffViolations) {
    const sevColor = v.severity === 'critical' ? colors.red : v.severity === 'error' ? colors.yellow : colors.cyan;
    console.log(`  ${sevColor}[${v.ruleId}] ${v.severity.toUpperCase()}${colors.reset}: ${v.message}`);
    console.log(`  ${colors.dim}File:${colors.reset} ${v.filename} (Line ~${v.lineNumber})`);
    console.log(`  ${colors.dim}Code:${colors.reset} ${colors.yellow}${v.codeSnippet}${colors.reset}\n`);
  }

  if (isStrict || args.includes('--strict')) {
    process.exit(1);
  }

} else if (command === 'hook' && args[1] === 'install') {
  const hooksDir = path.join(targetDir, '.git', 'hooks');
  if (!fs.existsSync(hooksDir)) {
    console.error(`${colors.red}❌ .git/hooks directory not found. Are you inside a Git repository root?${colors.reset}`);
    process.exit(1);
  }

  const preCommitPath = path.join(hooksDir, 'pre-commit');
  const hookScript = generatePreCommitHook();
  fs.writeFileSync(preCommitPath, hookScript, { mode: 0o755 });
  console.log(`${colors.green}✅ Pre-commit hook installed successfully!${colors.reset}`);
  console.log(`   RepoGuard will now automatically audit every commit before it hits your history.\n`);

} else if (command === 'review' || command === 'preview-pr') {
  console.log(`${colors.cyan}Simulating RepoGuard PR Review Comment...${colors.reset}\n`);
  let dummyDiff = '';
  try {
    dummyDiff = execSync('git diff HEAD~1', { encoding: 'utf8' });
  } catch (_) {
    dummyDiff = `
diff --git a/src/controllers/userController.ts b/src/controllers/userController.ts
+ import { db } from '../db';
+ export async function getUser(req, res) {
+   const user = await db.query("SELECT * FROM users WHERE id = " + req.params.id);
+   res.json(user);
+ }
`;
  }

  const md = generatePRReviewMarkdown(dummyDiff);
  console.log(md);

} else if (command === 'rules') {
  console.log(`${colors.bright}Active Architectural Guardrails (12 Rules):${colors.reset}\n`);
  for (const r of ARCHITECTURAL_RULES) {
    const sev = r.severity === 'critical' ? colors.red : r.severity === 'error' ? colors.yellow : colors.cyan;
    console.log(`  ${sev}${r.id}${colors.reset} [${r.category}] - ${colors.bright}${r.name}${colors.reset}`);
    console.log(`    ${colors.dim}${r.message}${colors.reset}\n`);
  }

} else if (command === 'fix') {
  console.log(`${colors.cyan}🛠️  Analyzing codebase for architectural auto-fixes & refactoring plans...${colors.reset}\n`);

  const files = scanDirectory(targetDir);
  let allViolations = [];

  for (const file of files) {
    const relativePath = path.relative(targetDir, file);
    try {
      const content = fs.readFileSync(file, 'utf8');
      const fileViolations = analyzeDiff(content, relativePath);
      allViolations = allViolations.concat(fileViolations);
    } catch (_) {}
  }

  if (allViolations.length === 0) {
    console.log(`${colors.green}✨ Flawless architecture! No fixes or refactorings required.${colors.reset}\n`);
    process.exit(0);
  }

  console.log(`${colors.bright}Found ${allViolations.length} item(s) to refactor:${colors.reset}\n`);

  for (const v of allViolations) {
    console.log(`${colors.dim}─── [${v.ruleId}] ${v.filename}:${v.lineNumber} ─────────────────────────────${colors.reset}`);
    console.log(`  ${colors.red}❌ Problematic: ${v.codeSnippet}${colors.reset}`);
    if (v.suggestion) {
      console.log(`  ${colors.green}✅ Suggested Fix: ${v.suggestion}${colors.reset}`);
    }
    console.log(`  ${colors.dim}💡 Architectural Note: ${v.message}${colors.reset}\n`);
  }

  console.log(`${colors.dim}─────────────────────────────────────────────────────────────────────────────${colors.reset}`);
  console.log(`💡 ${colors.bright}Need automated PR review bots & team CI enforcement?${colors.reset}`);
  console.log(`   Upgrade to RepoGuard Pro ($12/mo): ${colors.cyan}https://taylormatematica-beep.github.io/repoguard/#pricing${colors.reset}`);
  console.log(`${colors.dim}─────────────────────────────────────────────────────────────────────────────${colors.reset}\n`);

} else {
  console.log(`Usage:
  ${colors.bright}npx repoguard init${colors.reset}                  Generate .cursorrules, CLAUDE.md & Windsurf rules (Go, Python, TypeScript)
  ${colors.bright}npx repoguard audit${colors.reset}                 Full codebase scan with Architectural Health Score (A+ to F)
  ${colors.bright}npx repoguard audit --format=sarif${colors.reset}  Export SARIF v2.1.0 report for GitHub Code Scanning
  ${colors.bright}npx repoguard audit --format=json${colors.reset}   Export machine-readable JSON for custom CI/CD pipelines
  ${colors.bright}npx repoguard fix${colors.reset}                   Inspect and generate actionable architectural fixes
  ${colors.bright}npx repoguard mcp${colors.reset}                   Launch Model Context Protocol (MCP) server for Claude & Cursor
  ${colors.bright}npx repoguard diff${colors.reset}                  Audit uncommitted git changes in real-time
  ${colors.bright}npx repoguard hook install${colors.reset}          Install pre-commit hook to block AI drift locally
  ${colors.bright}npx repoguard review${colors.reset}                Simulate PR review audit for GitHub CI
  ${colors.bright}npx repoguard rules${colors.reset}                 List all active architectural rules
`);
}
