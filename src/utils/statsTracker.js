const { connectDB, Stats, Economy } = require("../models");

const getStats = async () => {
  await connectDB();
  const doc = await Stats.findOne({});
  return doc ? { history: doc.history } : { history: [] };
};

const trackStats = async (client) => {
  await connectDB();
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const stats = await getStats();

  if (stats.history.length > 0 && stats.history[stats.history.length - 1].date === dateStr) return;

  let totalMembers = 0;
  let totalCoins = 0;
  const economy = await Economy.find({});
  economy.forEach(e => totalCoins += e.balance || 0);
  client.guilds.cache.forEach(guild => totalMembers += guild.memberCount);

  stats.history.push({ date: dateStr, members: totalMembers, wealth: totalCoins });
  if (stats.history.length > 30) stats.history.shift();

  await Stats.findOneAndUpdate({}, { history: stats.history }, { upsert: true });
  console.log(`Stats tracked for ${dateStr}`);
};

module.exports = { getStats, trackStats };
