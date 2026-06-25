const { readJSON, writeJSON } = require("./jsonStore");

const FILE = "badwords.json";

const getBadWords = async () => readJSON(FILE, {});

const saveBadWords = async (data) => {
  const current = readJSON(FILE, {});
  for (const [guildId, words] of Object.entries(data)) {
    current[guildId] = words;
  }
  writeJSON(FILE, current);
};

module.exports = { getBadWords, saveBadWords };
