const { connectDB, BadWords } = require("../models");

const getBadWords = async () => {
  await connectDB();
  const docs = await BadWords.find({});
  const result = {};
  docs.forEach(d => result[d.guildId] = d.words);
  return result;
};

const saveBadWords = async (data) => {
  await connectDB();
  for (const [guildId, words] of Object.entries(data)) {
    await BadWords.findOneAndUpdate({ guildId }, { words }, { upsert: true });
  }
};

module.exports = { getBadWords, saveBadWords };
