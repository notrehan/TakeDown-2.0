const express = require("express");
const simpleGit = require("simple-git");
const fs = require("fs");
const path = require("path");
const scanForKeys = require("./scanner");

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(express.static("public"));

const git = simpleGit();

app.post("/scan-repo", async (req, res) => {
    const { repoUrl } = req.body;

    if (!repoUrl || !repoUrl.startsWith("https://github.com/")) {
        return res.status(400).json({ error: "Invalid GitHub URL" });
    }

    const repoName = repoUrl.split("/").pop().replace(".git", "");
    const repoPath = path.join(__dirname, "repos", repoName);

    try {
        // Delete old repo if exists
        if (fs.existsSync(repoPath)) {
            fs.rmSync(repoPath, { recursive: true, force: true });
        }

        // Clone repo
        await git.clone(repoUrl, repoPath, ["--depth", "1"]);

        // Scan repo
        const results = await scanForKeys(repoPath);

        res.json({ results });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to scan repo" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
