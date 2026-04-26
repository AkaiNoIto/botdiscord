const { connectDB, Lists } = require("../models");

const getLists = async () => {
  await connectDB();
  const doc = await Lists.findOne({});
  return doc ? { whitelist: doc.whitelist, blacklist: doc.blacklist } : { whitelist: [], blacklist: [] };
};

const saveLists = async (data) => {
  await connectDB();
  await Lists.findOneAndUpdate({}, data, { upsert: true });
};

const isWhitelisted = async (id) => { const l = await getLists(); return l.whitelist.includes(id); };
const isBlacklisted = async (id) => { const l = await getLists(); return l.blacklist.includes(id); };

module.exports = { getLists, saveLists, isWhitelisted, isBlacklisted };
