const { connectDB, AdSystem } = require("../models");

const getAdData = async () => {
  await connectDB();
  const docs = await AdSystem.find({});
  const result = {};
  docs.forEach(d => {
    if (!result[d.guildId]) result[d.guildId] = {};
    result[d.guildId][d.userId] = d.hasBought;
  });
  return result;
};

const saveAdData = async (data) => {
  await connectDB();
  for (const [guildId, users] of Object.entries(data)) {
    for (const [userId, hasBought] of Object.entries(users)) {
      await AdSystem.findOneAndUpdate({ guildId, userId }, { hasBought }, { upsert: true });
    }
  }
};

module.exports = { getAdData, saveAdData };
