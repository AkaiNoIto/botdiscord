const { connectDB, Shop } = require("../models");

const getShop = async () => {
  await connectDB();
  const docs = await Shop.find({});
  const result = {};
  docs.forEach(d => result[d.guildId] = d.items);
  return result;
};

const saveShop = async (data) => {
  await connectDB();
  for (const [guildId, items] of Object.entries(data)) {
    await Shop.findOneAndUpdate({ guildId }, { items }, { upsert: true });
  }
};

module.exports = { getShop, saveShop };
