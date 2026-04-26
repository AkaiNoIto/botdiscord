const { connectDB, Settings } = require("../models");

const getSettings = async () => {
  await connectDB();
  const docs = await Settings.find({});
  const result = {};
  docs.forEach(d => result[d.guildId] = { welcomeChannel: d.welcomeChannel, coinsPerMessage: d.coinsPerMessage, coinsPerVoiceMinute: d.coinsPerVoiceMinute, levelUpChannel: d.levelUpChannel, autoModEnabled: d.autoModEnabled });
  return result;
};

const saveSettings = async (data) => {
  await connectDB();
  for (const [guildId, val] of Object.entries(data)) {
    await Settings.findOneAndUpdate({ guildId }, val, { upsert: true });
  }
};

module.exports = { getSettings, saveSettings };
