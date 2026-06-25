const { readJSON, writeJSON } = require("./jsonStore");
const { getEconomy } = require("./economyManager");

const FILE = "stats.json";

const getStats = async () => {
  const data = readJSON(FILE, { history: [] });
  return { history: data.history || [] };
};

const trackStats = async (client) => {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const stats = await getStats();

  if (stats.history.length > 0 && stats.history[stats.history.length - 1].date === dateStr) return;

  let totalMembers = 0;
  let totalCoins = 0;
  const economy = await getEconomy();
  Object.values(economy).forEach(e => totalCoins += e.balance || 0);
  client.guilds.cache.forEach(guild => totalMembers += guild.memberCount);

  stats.history.push({ date: dateStr, members: totalMembers, wealth: totalCoins });
  if (stats.history.length > 30) stats.history.shift();

  writeJSON(FILE, { history: stats.history });
  console.log(`Stats tracked for ${dateStr}`);
};

module.exports = { getStats, trackStats };
