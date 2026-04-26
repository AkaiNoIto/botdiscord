const { connectDB, CustomCommands } = require("../models");

const getCustomCommands = async () => {
  await connectDB();
  const docs = await CustomCommands.find({});
  const result = {};
  docs.forEach(d => {
    result[d.guildId] = {};
    d.commands.forEach((val, key) => result[d.guildId][key] = { text: val.text, image: val.image });
  });
  return result;
};

const saveCustomCommands = async (data) => {
  await connectDB();
  for (const [guildId, commands] of Object.entries(data)) {
    await CustomCommands.findOneAndUpdate({ guildId }, { commands }, { upsert: true });
  }
};

module.exports = { getCustomCommands, saveCustomCommands };
