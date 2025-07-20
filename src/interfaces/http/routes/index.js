const express = require("express");
const fs = require("fs");
const path = require("path");
const { startLogin, verifyLogin, runExportWithToken } = require("../../../application/exporter");

const router = express.Router();
const CSV_PATH = path.join(process.cwd(), "export.csv");
let loginProcess = null;

router.get("/", (req, res) => {
  if (!fs.existsSync(CSV_PATH)) {
    return res.send("CSV file not found. Run the exporter first.");
  }
  const content = fs.readFileSync(CSV_PATH, "utf8");
  const lines = content.trim().split("\n");
  const headers = lines.shift().split(";");
  const rows = lines.map(l => l.split(";"));
  res.render("index", { headers, rows });
});

router.post("/export/start", async (req, res) => {
  try {
    loginProcess = await startLogin();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/export/finish", async (req, res) => {
  if (!loginProcess) {
    return res.status(400).json({ success: false, error: "Process not started" });
  }
  const code = req.body.code;
  if (!code) {
    return res.status(400).json({ success: false, error: "Code manquant" });
  }
  try {
    const token = await verifyLogin(loginProcess, code);
    await runExportWithToken(token);
    loginProcess = null;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    loginProcess = null;
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
