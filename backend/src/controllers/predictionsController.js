import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../../..");
const SCRIPT_PATH = path.join(REPO_ROOT, "ml", "predict_etf.py");

function runPythonScript(args = []) {
  const pythonExecutable = process.env.PYTHON_EXECUTABLE || "python";

  return new Promise((resolve, reject) => {
    const child = spawn(pythonExecutable, [SCRIPT_PATH, ...args], {
      cwd: REPO_ROOT,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(
            `Python script exited with code ${code}: ${
              stderr || "unknown error"
            }`
          )
        );
      }
      resolve(stdout);
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}

export async function getPredictions(req, res) {
  const rawSymbols = req.query.symbols;
  const symbols = rawSymbols
    ? String(rawSymbols)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const args = [];
  if (symbols.length > 0) {
    args.push("--symbols", ...symbols);
  }

  try {
    const output = await runPythonScript(args);
    const parsed = JSON.parse(output);
    res.json(parsed);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la génération des prédictions",
      details: error.message,
    });
  }
}
