const { getEconomy, saveEconomy } = require("../src/utils/economyManager");
const { getSettings } = require("../src/utils/settingsManager");
const { EmbedBuilder } = require("discord.js");
const voiceJoinTimes = new Map();

module.exports = {
    name: "voiceStateUpdate",
    async execute(oldState, newState) {
        if (newState.member.user.bot) return;
        const guildId = newState.guild.id;
        const userId = newState.member.id;
        const settings = await getSettings();
        const guildSettings = settings[guildId] || {};
        const coinsPerMinute = guildSettings.coinsPerVoiceMinute || 0;

        // Joined VC
        if (!oldState.channelId && newState.channelId) {
            voiceJoinTimes.set(userId, Date.now());
        }

        // Left VC
        else if (oldState.channelId && !newState.channelId) {
            const joinTime = voiceJoinTimes.get(userId);
            if (joinTime && coinsPerMinute > 0) {
                const minutesSpent = Math.floor((Date.now() - joinTime) / 60000);
                if (minutesSpent > 0) {
                    const economy = await getEconomy();
                    if (!economy[userId]) economy[userId] = { balance: 0 };
                    economy[userId].balance += minutesSpent * coinsPerMinute;
                    await saveEconomy(economy);
                }
            }
            voiceJoinTimes.delete(userId);
        }
    }
};
