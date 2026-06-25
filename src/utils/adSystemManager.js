const { readJSON, writeJSON } = require("./jsonStore");

const FILE = "adSystem.json";

const getAdData = async () => readJSON(FILE, {});

const saveAdData = async (data) => {
  const current = readJSON(FILE, {});
  for (const [guildId, users] of Object.entries(data)) {
    current[guildId] = { ...(current[guildId] || {}), ...users };
  }
  writeJSON(FILE, current);
};

module.exports = { getAdData, saveAdData };
