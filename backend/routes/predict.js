import express from "express";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 
// Helper to run the python script with JSON stdin and return parsed JSON
function runPythonPredict(data) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, "../model/api_predict.py");
    const isWin = process.platform === "win32";
    const projectRoot = path.resolve(__dirname, "../..");
    const venvPython = isWin
      ? path.join(projectRoot, ".venv", "Scripts", "python.exe")
      : path.join(projectRoot, ".venv", "bin", "python");
    const pythonExe = fs.existsSync(venvPython)
      ? venvPython
      : (process.env.PYTHON_EXECUTABLE || (isWin ? "py" : "python"));

    const py = spawn(pythonExe, [scriptPath], {
      cwd: path.resolve(__dirname, ".."),
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    py.stdout.on("data", (d) => (stdout += d.toString()));
    py.stderr.on("data", (d) => (stderr += d.toString()));
    py.on("error", (err) => {
      reject(new Error(`Failed to spawn Python process: ${err.message}`));
    });
    py.on("close", (code) => {
      if (code !== 0) {
        const errorMsg = stderr || stdout || `Python process exited with code ${code}`;
        return reject(new Error(errorMsg));
      }
      try {
        const parsed = JSON.parse(stdout);
        if (parsed.error) {
          return reject(new Error(`Python error: ${parsed.error}`));
        }
        resolve(parsed);
      } catch (e) {
        reject(new Error(`Failed to parse Python output: ${e.message}. Output: ${stdout.substring(0, 200)}`));
      }
    });
    py.stdin.write(JSON.stringify(data));
    py.stdin.end();
  });
}

function runPythonFeatureImportance() {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, "../model/api_predict.py");
    const isWin = process.platform === "win32";
    const projectRoot = path.resolve(__dirname, "../..");
    const venvPython = isWin
      ? path.join(projectRoot, ".venv", "Scripts", "python.exe")
      : path.join(projectRoot, ".venv", "bin", "python");
    const pythonExe = fs.existsSync(venvPython)
      ? venvPython
      : (process.env.PYTHON_EXECUTABLE || (isWin ? "py" : "python"));

    const env = { ...process.env, ACTION: "feature_importance" };
    const py = spawn(pythonExe, [scriptPath], {
      cwd: path.resolve(__dirname, ".."),
      stdio: ["pipe", "pipe", "pipe"],
      env,
    });
    let stdout = "";
    let stderr = "";
    py.stdout.on("data", (d) => (stdout += d.toString()));
    py.stderr.on("data", (d) => (stderr += d.toString()));
    py.on("error", (err) => {
      reject(new Error(`Failed to spawn Python process: ${err.message}`));
    });
    py.on("close", (code) => {
      if (code !== 0) {
        const errorMsg = stderr || stdout || `Python process exited with code ${code}`;
        return reject(new Error(errorMsg));
      }
      try {
        const parsed = JSON.parse(stdout);
        if (parsed.error) {
          return reject(new Error(`Python error: ${parsed.error}`));
        }
        resolve(parsed);
      } catch (e) {
        reject(new Error(`Failed to parse Python output: ${e.message}. Output: ${stdout.substring(0, 200)}`));
      }
    });
    py.stdin.end();
  });
}

// Batch predictions and aggregates for Institutional pages
router.post("/batch", async (req, res) => {
  try {
    const rows = req.body?.data;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: "Invalid input: body.data must be a non-empty array" });
    }

    console.log(`[Batch] Processing ${rows.length} rows`);

    const [predResp, fiResp] = await Promise.all([
      runPythonPredict(rows).catch(err => {
        console.error('[Batch] Prediction error:', err.message);
        throw err;
      }),
      runPythonFeatureImportance().catch(err => {
        console.error('[Batch] Feature importance error (non-fatal):', err.message);
        return { globalFeatureImportance: [] };
      }),
    ]);

    const results = Array.isArray(predResp?.results) ? predResp.results : [];
    // Join predictions with input rows by index
    const enriched = rows.map((row, idx) => ({
      row,
      label: results[idx]?.label || null,
      confidence: results[idx]?.confidence ?? null,
    }));

    // Aggregates
    const countsByDisease = {};
    const riskBands = { noRisk: 0, low: 0, medium: 0, high: 0 };
    const byMonth = {};
    const diseaseByMonth = {};

    const monthKey = (d) => {
      try {
        if (!d) return null;
        const dt = new Date(d);
        if (isNaN(dt.getTime())) return null;
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
      } catch { return null; }
    };

    for (const item of enriched) {
      const label = item.label || 'Unknown';
      countsByDisease[label] = (countsByDisease[label] || 0) + 1;
      const c = (typeof item.confidence === 'number') ? item.confidence : 0;
      let band = 'noRisk';
      if (c >= 80) band = 'high'; else if (c >= 60) band = 'medium'; else if (c >= 40) band = 'low';
      riskBands[band]++;

      const mk = monthKey(item.row?.lastScreening);
      if (mk) {
        byMonth[mk] ||= { month: mk, screenings: 0, highRisk: 0, noRisk: 0, low: 0, medium: 0, high: 0 };
        byMonth[mk].screenings++;
        byMonth[mk][band]++;

        diseaseByMonth[mk] ||= {};
        diseaseByMonth[mk][label] = (diseaseByMonth[mk][label] || 0) + 1;
      }
    }

    // Build arrays
    const riskDistribution = [
      { name: 'No Risk', value: riskBands.noRisk, color: '#10B981' },
      { name: 'Low Risk', value: riskBands.low, color: '#22C55E' },
      { name: 'Medium Risk', value: riskBands.medium, color: '#F59E0B' },
      { name: 'High Risk', value: riskBands.high, color: '#EF4444' },
    ];

    const monthlyScreenings = Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)).map(v => ({
      month: v.month,
      screenings: v.screenings,
      highRisk: v.high || 0,
    }));

    // Pick top 5 diseases overall, then build incidence matrix
    const topDiseases = Object.entries(countsByDisease).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([d]) => d);
    const diseaseRows = Object.keys(byMonth).sort().map((m) => {
      const row = { month: m };
      for (const d of topDiseases) row[d] = diseaseByMonth[m]?.[d] || 0;
      return row;
    });
    const diseaseIncidence = { diseases: topDiseases, rows: diseaseRows };

    const globalFeatureImportance = Array.isArray(fiResp?.globalFeatureImportance) ? fiResp.globalFeatureImportance : [];

    res.json({
      results,
      countsByDisease,
      riskDistribution,
      monthlyScreenings,
      riskTrends: Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)).map(({ month, noRisk, low, medium, high }) => ({ month, noRisk, low, medium, high })),
      diseaseIncidence,
      globalFeatureImportance,
    });
  } catch (err) {
    console.error('Batch predict error:', err);
    res.status(500).json({ error: 'Batch prediction failed', details: err?.message || String(err) });
  }
});

// POST /api/predict
// Expects body: { data: { ...featureKeyValues } } OR { data: [{...}, {...}] }
router.post("/", async (req, res) => {
  try {
    const input = req.body?.data;
    if (!input || (typeof input !== "object" && !Array.isArray(input))) {
      return res.status(400).json({ error: "Invalid input: body.data must be an object or array of objects" });
    }

    const scriptPath = path.resolve(__dirname, "../model/api_predict.py");
    const isWin = process.platform === "win32";
    // Try project local venv first
    const projectRoot = path.resolve(__dirname, "../..");
    const venvPython = isWin
      ? path.join(projectRoot, ".venv", "Scripts", "python.exe")
      : path.join(projectRoot, ".venv", "bin", "python");
    const pythonExe = fs.existsSync(venvPython)
      ? venvPython
      : (process.env.PYTHON_EXECUTABLE || (isWin ? "py" : "python"));

    const py = spawn(pythonExe, [scriptPath], {
      cwd: path.resolve(__dirname, ".."),
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    py.stdout.on("data", (data) => (stdout += data.toString()));
    py.stderr.on("data", (data) => (stderr += data.toString()));

    py.on("close", (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: "Prediction script failed", details: stderr.trim() });
      }
      try {
        const parsed = JSON.parse(stdout);
        return res.json(parsed);
      } catch (e) {
        return res.status(500).json({ error: "Invalid JSON from prediction script", details: stdout.trim() });
      }
    });

    // Write input JSON to python stdin
    py.stdin.write(JSON.stringify(input));
    py.stdin.end();
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err?.message || String(err) });
  }
});

export default router;
