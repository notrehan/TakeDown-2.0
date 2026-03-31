const fs = require("fs");
const path = require("path");

// 🔍 Patterns for secrets
const patterns = [
  { type: "API_KEY", regex: /sk-[a-zA-Z0-9]{20,}/ },
  { type: "API_KEY", regex: /ghp_[A-Za-z0-9]{36}/ },
  { type: "API_KEY", regex: /AIza[0-9A-Za-z-_]{35}/ },
  { type: "API_KEY", regex: /api[_-]?key\s*[:=]\s*['"][^'"]{10,}['"]/i },
  { type: "API_KEY", regex: /Bearer\s+[a-zA-Z0-9\.\-_]{20,}/ }
];

// 📂 Get all files recursively
function getAllFiles(dir) {
  let results = [];

  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  });

  return results;
}

// 🔥 MAIN SCANNER
async function scanForKeys(repoPath) {
  const files = getAllFiles(repoPath);
  const findings = [];

  files.forEach(file => {
    const content = fs.readFileSync(file, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line, index) => {

      // 🔐 API KEYS
      patterns.forEach(p => {
        if (p.regex.test(line)) {
          findings.push({
            type: "API_KEY",
            file: file.replace(repoPath, ""),
            lineNumber: index + 1
          });
        }
      });

      // 💉 SQL INJECTION (simple heuristic)
        if (
    line.match(/SELECT/i) &&
    (line.includes("+") || line.includes("${"))
  ) {
    findings.push({
      type: "SQL_INJECTION",
      file: file.replace(repoPath, ""),
      lineNumber: index + 1
    });
} {
        findings.push({
          type: "SQL_INJECTION",
          file: file.replace(repoPath, ""),
          lineNumber: index + 1
        });
      }

      // 🧨 XSS
    if (
      line.includes("innerHTML") ||
      line.includes("outerHTML")
    ) {
      findings.push({
        type: "XSS",
        file: file.replace(repoPath, ""),
        lineNumber: index + 1
      });
    }

      // 🌐 Uncontrolled API calls
      if (
        line.includes("fetch(") ||
        line.includes("axios(") ||
        line.includes("axios.get") ||
        line.includes("axios.post")
      ) {
        findings.push({
          type: "UNCONTROLLED_API",
          file: file.replace(repoPath, ""),
          lineNumber: index + 1
        });
      }

      // 🔓 Hardcoded credentials
      if (/password\s*=\s*['"].+['"]/.test(line)) {
        findings.push({
          type: "HARDCODED_SECRET",
          file: file.replace(repoPath, ""),
          lineNumber: index + 1
        });
      }

      // ⚠️ Debug logs
      if (line.includes("console.log")) {
        findings.push({
          type: "DEBUG_CODE",
          file: file.replace(repoPath, ""),
          lineNumber: index + 1
        });
      }

    });
  });

  return findings;
}

module.exports = scanForKeys;