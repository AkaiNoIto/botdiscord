const { connectDB, Settings } = require("../models");

const getSettings = async () => {
  await connectDB();
  const docs = await Settings.find({});
  const result = {};
  docs.forEach(d => result[d.guildId] = { welcomeChannel: d.welcomeChannel, welcomeMessage: d.welcomeMessage, coinsPerMessage: d.coinsPerMessage, coinsPerVoiceMinute: d.coinsPerVoiceMinute, levelUpChannel: d.levelUpChannel, levelingEnabled: d.levelingEnabled, autoModEnabled: d.autoModEnabled, leaveChannel: d.leaveChannel, leaveMessage: d.leaveMessage, ticketCategory: d.ticketCategory, ticketAdminRole: d.ticketAdminRole, ticketLogChannel: d.ticketLogChannel, logMsgSend: d.logMsgSend, logMsgEdit: d.logMsgEdit, logMsgDelete: d.logMsgDelete, logVoice: d.logVoice, adChannelId: d.adChannelId, adRoleId: d.adRoleId, adInitialPrice: d.adInitialPrice, adRechargePrice: d.adRechargePrice });
  return result;
};

const saveSettings = async (data) => {
  await connectDB();
  for (const [guildId, val] of Object.entries(data)) {
    await Settings.findOneAndUpdate({ guildId }, val, { upsert: true });
  }
};

module.exports = { getSettings, saveSettings };

