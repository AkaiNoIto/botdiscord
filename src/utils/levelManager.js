const { connectDB, Level } = require("../models");

const getLevels = async () => {
  await connectDB();
  const docs = await Level.find({});
  const result = {};
  docs.forEach(d => {
    if (!result[d.guildId]) result[d.guildId] = {};
    result[d.guildId][d.userId] = { xp: d.xp, level: d.level };
  });
  return result;
};

const saveLevels = async (data) => {
  await connectDB();
  for (const [guildId, users] of Object.entries(data)) {
    for (const [userId, val] of Object.entries(users)) {
      await Level.findOneAndUpdate({ guildId, userId }, { xp: val.xp, level: val.level }, { upsert: true });
    }
  }
};

module.exports = { getLevels, saveLevels };
