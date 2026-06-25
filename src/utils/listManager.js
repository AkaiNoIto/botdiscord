const { readJSON, writeJSON } = require("./jsonStore");

const FILE = "lists.json";

const getLists = async () => readJSON(FILE, { whitelist: [], blacklist: [] });

const saveLists = async (data) => {
  const current = readJSON(FILE, { whitelist: [], blacklist: [] });
  writeJSON(FILE, { ...current, ...data });
};

const isWhitelisted = async (id) => { const l = await getLists(); return l.whitelist.includes(id); };
const isBlacklisted = async (id) => { const l = await getLists(); return l.blacklist.includes(id); };

module.exports = { getLists, saveLists, isWhitelisted, isBlacklisted };
