require("dotenv").config();
const express = require("express");

const app = express();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const WORKFLOW_URL =
  "https://api.github.com/repos/visco12/visco_scrapping/actions/workflows/cron.yml/dispatches";

// -----------------------------
// Trigger GitHub Workflow
// -----------------------------
async function triggerWorkflow() {
  try {
    const res = await fetch(WORKFLOW_URL, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ref: "main"
      })
    });

    console.log("✅ Workflow triggered:", res.status);
  } catch (err) {
    console.log("❌ Error triggering workflow:", err.message);
  }
}

// -----------------------------
// Run immediately on start
// -----------------------------
triggerWorkflow();

// -----------------------------
// Run every 1 hour
// -----------------------------
setInterval(() => {
  console.log("⏰ Hourly trigger running...");
  triggerWorkflow();
}, 60 * 60 * 1000);

// -----------------------------
// Health check endpoint (UptimeRobot hits this)
// -----------------------------
app.get("/", (req, res) => {
  res.send("ESCO Trigger Bot Running ✅");
});

// Manual trigger endpoint
app.get("/run", async (req, res) => {
  await triggerWorkflow();
  res.send("Workflow triggered manually 🚀");
});

// -----------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Trigger Bot running on port", PORT);
});
