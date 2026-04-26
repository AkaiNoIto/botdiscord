const { connectDB, BotStatus } = require("../models");

const updateBotStatus = async (client) => {
  await connectDB();
  const status = {
    guilds: client.guilds.cache.size,
    guildIds: Array.from(client.guilds.cache.keys()),
    users: client.users.cache.size,
    uptime: client.uptime,
    lastUpdate: Date.now()
  };
  await BotStatus.findOneAndUpdate({}, status, { upsert: true });
};

module.exports = { updateBotStatus };
