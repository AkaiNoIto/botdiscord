const { connectDB, Economy } = require("../models");

const getEconomy = async () => {
  await connectDB();
  const docs = await Economy.find({});
  const result = {};
  docs.forEach(d => result[d.userId] = { balance: d.balance });
  return result;
};

const saveEconomy = async (data) => {
  await connectDB();
  for (const [userId, val] of Object.entries(data)) {
    await Economy.findOneAndUpdate({ userId }, { balance: val.balance }, { upsert: true });
  }
};

module.exports = { getEconomy, saveEconomy };
