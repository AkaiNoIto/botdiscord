const { readJSON, writeJSON } = require("./jsonStore");

const FILE = "shop.json";

const getShop = async () => readJSON(FILE, {});

const saveShop = async (data) => {
  const current = readJSON(FILE, {});
  for (const [guildId, items] of Object.entries(data)) {
    current[guildId] = items;
  }
  writeJSON(FILE, current);
};

module.exports = { getShop, saveShop };
