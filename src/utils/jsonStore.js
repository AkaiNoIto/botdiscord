const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Lit un fichier JSON dans src/data. Crée le fichier avec une valeur par
 * défaut s'il n'existe pas encore ou s'il est vide/corrompu.
 */
function readJSON(filename, defaultValue) {
  const filePath = path.join(DATA_DIR, filename);

  if (!fs.existsSync(filePath)) {
    writeJSON(filename, defaultValue);
    return defaultValue;
  }

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    if (!raw.trim()) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[jsonStore] Erreur de lecture sur ${filename}, valeur par défaut utilisée :`, err.message);
    return defaultValue;
  }
}

/**
 * Écrit un objet dans un fichier JSON de src/data (écriture atomique via
 * fichier temporaire pour éviter de corrompre le fichier en cas de crash).
 */
function writeJSON(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 4), "utf-8");
  fs.renameSync(tmpPath, filePath);
}

module.exports = { readJSON, writeJSON };
