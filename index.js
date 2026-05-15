require("dotenv").config();
const express = require("express");

const app = express();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const WORKFLOW_URL =
  "https://api.github.com/repos/visco12/visco_scrapping/actions/workflows/cron.yml/dispatches";

// -----------------------------
// SAFE FETCH (Node 20 compatible)
// -----------------------------
const fetchFn =
  global.fetch || ((...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args)));

// -----------------------------
// Prevent spam triggers
// -----------------------------
let isTriggering = false;

// -----------------------------
// Trigger GitHub Workflow
// -----------------------------
async function triggerWorkflow(source = "unknown") {
  if (isTriggering) {
    console.log("⛔ Trigger blocked (already running)");
    return;
  }

  isTriggering = true;

  try {
    const res = await fetchFn(WORKFLOW_URL, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "esco-trigger-bot"
      },
      body: JSON.stringify({
        ref: "main"
      })
    });

    const text = await res.text();

    console.log("📡 Trigger source:", source);
    console.log("📡 GitHub status:", res.status);
    console.log("📡 Response:", text);

    if (res.status === 204) {
      console.log("✅ Workflow triggered successfully");
    } else {
      console.log("⚠️ Trigger may have failed");
    }
  } catch (err) {
    console.log("❌ Trigger error:", err.message);
  } finally {
    isTriggering = false;
  }
}

// -----------------------------
// UptimeRobot / health check
// -----------------------------
app.get("/", (req, res) => {
  res.send("ESCO Trigger Bot Running ✅");
});

// -----------------------------
// Manual trigger
// -----------------------------
app.get("/run", async (req, res) => {
  triggerWorkflow("manual");
  res.send("Workflow trigger started 🚀");
});

// -----------------------------
// OPTIONAL: lightweight interval (NOT heavy scraping)
// -----------------------------
setInterval(() => {
  console.log("⏰ Scheduled trigger (1 hour)");
  triggerWorkflow("interval");
}, 60 * 60 * 1000);

// -----------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Trigger Bot running on port", PORT);

  // first run after boot delay
  setTimeout(() => triggerWorkflow("startup"), 15000);
});