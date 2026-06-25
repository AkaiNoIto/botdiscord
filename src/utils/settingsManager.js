const { readJSON, writeJSON } = require("./jsonStore");

const FILE = "settings.json";

const getSettings = async () => readJSON(FILE, {});

const saveSettings = async (data) => {
  const current = readJSON(FILE, {});
  for (const [guildId, val] of Object.entries(data)) {
    current[guildId] = { ...(current[guildId] || {}), ...val };
  }
  writeJSON(FILE, current);
};

module.exports = { getSettings, saveSettings };
