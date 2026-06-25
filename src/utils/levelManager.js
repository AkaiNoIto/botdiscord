const { readJSON, writeJSON } = require("./jsonStore");

const FILE = "levels.json";

const getLevels = async () => readJSON(FILE, {});

const saveLevels = async (data) => {
  const current = readJSON(FILE, {});
  for (const [guildId, users] of Object.entries(data)) {
    current[guildId] = current[guildId] || {};
    for (const [userId, val] of Object.entries(users)) {
      current[guildId][userId] = { xp: val.xp, level: val.level };
    }
  }
  writeJSON(FILE, current);
};

module.exports = { getLevels, saveLevels };
