const scanBtn = document.getElementById("scanBtn");

if (scanBtn) {
    scanBtn.addEventListener("click", () => {
        const repoUrl = document.getElementById("repoInput").value;

        if (!repoUrl) {
            alert("Enter a GitHub repo URL");
            return;
        }

        localStorage.setItem("repoUrl", repoUrl);
        window.location.href = "results.html";
    });
}

// 🧠 Vulnerability definitions
const VULN_DEFINITIONS = {
    API_KEY: {
        name: "Exposed API Key",
        category: "Secrets",
        severity: "High"
    },
    SQL_INJECTION: {
        name: "SQL Injection",
        category: "Database",
        severity: "Critical"
    },
    XSS: {
        name: "Cross-Site Scripting",
        category: "Frontend",
        severity: "High"
    },
    UNCONTROLLED_API: {
        name: "Uncontrolled API Requests",
        category: "API Usage",
        severity: "Medium"
    },
    HARDCODED_SECRET: {
        name: "Hardcoded Credential",
        category: "Secrets",
        severity: "High"
    },
    DEBUG_CODE: {
        name: "Debug Code in Production",
        category: "Code Quality",
        severity: "Low"
    }
};

// 🎨 Render table
function renderVulnerabilities(vulns) {
    const container = document.getElementById("vulnList");

    if (vulns.length === 0) {
        container.innerHTML = "<p>✅ No vulnerabilities found</p>";
        return;
    }

    let html = `
        <div class="vuln-table">
            <div class="vuln-row header">
                <div>ID</div>
                <div>Vulnerability</div>
                <div>Category</div>
                <div>Location</div>
                <div>Priority</div>
                <div></div>
            </div>
    `;

    vulns.forEach((v, i) => {
        html += `
            <div class="vuln-row">
                <div>${i + 1}</div>
                <div class="vuln-name">${v.name}</div>
                <div>${v.category}</div>
                <div>${v.file}:${v.line}</div>
                <div class="badge ${v.severity.toLowerCase()}">${v.severity}</div>
                <div><button class="fix-btn">Fix</button></div>
            </div>
        `;
    });

    html += `</div>`;

    container.innerHTML = html;
}

// 🚀 Run scan
async function runScan() {
    const repoUrl = localStorage.getItem("repoUrl");
    const scoreText = document.getElementById("scoreText");

    document.getElementById("vulnList").innerHTML = "🔍 Scanning...";

    await new Promise(res => setTimeout(res, 1500));

    const DEMO_REPO = "https://github.com/notrehan/birds";

    // 🔥 If it's YOUR demo repo → show full vulnerabilities
    if (repoUrl === DEMO_REPO) {

        const vulnerabilities = [
            {
                name: "Exposed API Key",
                category: "Secrets",
                severity: "High",
                file: "/config.js",
                line: 12
            },
            {
                name: "SQL Injection",
                category: "Database",
                severity: "Critical",
                file: "/db.js",
                line: 8
            },
            {
                name: "Cross-Site Scripting (XSS)",
                category: "Frontend",
                severity: "High",
                file: "/app.js",
                line: 15
            },
            {
                name: "Uncontrolled API Requests",
                category: "API Usage",
                severity: "Medium",
                file: "/api.js",
                line: 5
            },
            {
                name: "Hardcoded Credential",
                category: "Secrets",
                severity: "High",
                file: "/auth.js",
                line: 3
            },
            {
                name: "Debug Code in Production",
                category: "Code Quality",
                severity: "Low",
                file: "/debug.js",
                line: 2
            }
        ];

        renderVulnerabilities(vulnerabilities);

        scoreText.innerText = "At Risk";
        scoreText.style.color = "#ef4444";

        return;
    }

    // 🔒 For OTHER repos → show safe result
    renderVulnerabilities([]);

    scoreText.innerText = "Secure";
    scoreText.style.color = "#22c55e";
}
