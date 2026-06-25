const { readJSON, writeJSON } = require("./jsonStore");

const FILE = "customCommands.json";

const getCustomCommands = async () => readJSON(FILE, {});

const saveCustomCommands = async (data) => {
  const current = readJSON(FILE, {});
  for (const [guildId, commands] of Object.entries(data)) {
    current[guildId] = commands;
  }
  writeJSON(FILE, current);
};

module.exports = { getCustomCommands, saveCustomCommands };
