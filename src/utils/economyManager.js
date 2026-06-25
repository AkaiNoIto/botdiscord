const { readJSON, writeJSON } = require("./jsonStore");

const FILE = "economy.json";

const getEconomy = async () => readJSON(FILE, {});

const saveEconomy = async (data) => {
  const current = readJSON(FILE, {});
  for (const [userId, val] of Object.entries(data)) {
    current[userId] = { balance: val.balance };
  }
  writeJSON(FILE, current);
};

module.exports = { getEconomy, saveEconomy };
