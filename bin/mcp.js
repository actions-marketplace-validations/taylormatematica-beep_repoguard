const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { scanDirectory, analyzeDiff, calculateHealthScore, ARCHITECTURAL_RULES } = require('./analyzer');

function startMCPServer() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  function sendResponse(id, result, error) {
    const res = { jsonrpc: '2.0', id };
    if (error) res.error = error;
    else res.result = result;
    process.stdout.write(JSON.stringify(res) + '\n');
  }

  rl.on('line', (line) => {
    if (!line.trim()) return;
    try {
      const msg = JSON.parse(line);
      const { id, method, params } = msg;

      if (method === 'initialize') {
        sendResponse(id, {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'repoguard-mcp', version: '1.6.0' }
        });
      } else if (method === 'notifications/initialized') {
        // Notification, no reply expected
      } else if (method === 'tools/list') {
        sendResponse(id, {
          tools: [
            {
              name: 'repoguard_audit',
              description: 'Audits a repository or file against 12 Clean Architecture guardrails (TypeScript, Python, Golang) in ~12ms',
              inputSchema: {
                type: 'object',
                properties: {
                  directory: { type: 'string', description: 'Directory path to audit (defaults to current working directory)' }
                }
              }
            },
            {
              name: 'repoguard_get_rules',
              description: 'Returns all 12 active architectural rules to prevent AI hallucination of invalid layering patterns',
              inputSchema: { type: 'object', properties: {} }
            },
            {
              name: 'repoguard_fix',
              description: 'Analyzes a code snippet and returns actionable clean architecture refactoring suggestions',
              inputSchema: {
                type: 'object',
                properties: {
                  code: { type: 'string', description: 'Source code content to inspect' },
                  filename: { type: 'string', description: 'Filename (e.g. src/components/UserProfile.tsx)' }
                },
                required: ['code', 'filename']
              }
            }
          ]
        });
      } else if (method === 'tools/call') {
        const { name, arguments: args = {} } = params || {};
        if (name === 'repoguard_get_rules') {
          const rulesText = ARCHITECTURAL_RULES.map(r => `[${r.id}] (${r.severity}) ${r.name}: ${r.message}`).join('\n');
          sendResponse(id, {
            content: [{ type: 'text', text: `RepoGuard v1.6.0 Architectural Rules (${ARCHITECTURAL_RULES.length} active):\n\n${rulesText}` }]
          });
        } else if (name === 'repoguard_audit') {
          const dir = args.directory || process.cwd();
          const files = scanDirectory(dir);
          let allViolations = [];
          for (const file of files) {
            try {
              const content = fs.readFileSync(file, 'utf8');
              const rel = path.relative(dir, file);
              allViolations = allViolations.concat(analyzeDiff(content, rel));
            } catch (_) {}
          }
          const { score, grade } = calculateHealthScore(allViolations);
          const summary = `RepoGuard Audit Complete:\nHealth Score: ${score}/100 (Grade: ${grade})\nAudited Files: ${files.length}\nTotal Violations: ${allViolations.length}\n\n` +
            allViolations.map(v => `- [${v.ruleId}] ${v.filename}:${v.lineNumber} - ${v.message}\n  Fix: ${v.suggestion || 'Refactor to clean architecture'}`).join('\n');
          sendResponse(id, { content: [{ type: 'text', text: summary }] });
        } else if (name === 'repoguard_fix') {
          const { code, filename } = args;
          const violations = analyzeDiff(code, filename);
          if (violations.length === 0) {
            sendResponse(id, { content: [{ type: 'text', text: '✨ Flawless architecture! Zero violations found in this snippet.' }] });
          } else {
            const report = `Found ${violations.length} architectural item(s) to refactor in ${filename}:\n\n` +
              violations.map(v => `❌ Line ${v.lineNumber}: ${v.message}\n💡 Suggested Fix: ${v.suggestion || 'Move into service layer'}`).join('\n\n');
            sendResponse(id, { content: [{ type: 'text', text: report }] });
          }
        } else {
          sendResponse(id, null, { code: -32601, message: `Tool not found: ${name}` });
        }
      } else {
        sendResponse(id, null, { code: -32601, message: `Method not found: ${method}` });
      }
    } catch (e) {
      // JSON parse error
    }
  });
}

module.exports = { startMCPServer };
