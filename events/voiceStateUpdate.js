const { getEconomy, saveEconomy } = require('../src/utils/economyManager');
const { getSettings } = require('../src/utils/settingsManager');

// In-memory cache to track when members joined a VC
const voiceJoinTimes = new Map(); // Key: userId, Value: timestamp

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        if (newState.member.user.bot) return;

        const guildId = newState.guild.id;
        const userId = newState.member.id;

        const settings = getSettings();
        const guildSettings = settings[guildId] || {};
        const coinsPerMinute = guildSettings.coinsPerVoiceMinute || 0;

        const { EmbedBuilder } = require('discord.js');
        const logChannelId = guildSettings.logVoice;
        const logChannel = logChannelId ? newState.guild.channels.cache.get(logChannelId) : null;

        // User joined a voice channel
        if (!oldState.channelId && newState.channelId) {
            voiceJoinTimes.set(userId, Date.now());
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle('Salon Vocal Rejoint')
                    .setColor('#2ECC71')
                    .setAuthor({ name: newState.member.user.tag, iconURL: newState.member.user.displayAvatarURL() })
                    .setDescription(`${newState.member} a rejoint <#${newState.channelId}>`)
                    .setTimestamp();
                logChannel.send({ embeds: [embed] }).catch(() => {});
            }
        }
        
        // User switched channels
        else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle('Changement de Salon Vocal')
                    .setColor('#3498DB')
                    .setAuthor({ name: newState.member.user.tag, iconURL: newState.member.user.displayAvatarURL() })
                    .setDescription(`${newState.member} s'est déplacé de <#${oldState.channelId}> vers <#${newState.channelId}>`)
                    .setTimestamp();
                logChannel.send({ embeds: [embed] }).catch(() => {});
            }
        }

        // User left a voice channel
        else if (oldState.channelId && !newState.channelId) {
            const joinTime = voiceJoinTimes.get(userId);
            if (joinTime && coinsPerMinute > 0) {
                const timeSpentMs = Date.now() - joinTime;
                const minutesSpent = Math.floor(timeSpentMs / 60000);

                if (minutesSpent > 0) {
                    const economy = getEconomy();
                    if (!economy[userId]) economy[userId] = { balance: 0 };
                    
                    const earnedCoins = minutesSpent * coinsPerMinute;
                    economy[userId].balance += earnedCoins;
                    
                    saveEconomy(economy);
                    console.log(`[Passive Economy] ${newState.member.user.tag} a gagné ${earnedCoins} coins pour ${minutesSpent}min en vocal.`);
                }
            }
            voiceJoinTimes.delete(userId); // clear their session

            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle('Salon Vocal Quitté')
                    .setColor('#ED4245')
                    .setAuthor({ name: newState.member.user.tag, iconURL: newState.member.user.displayAvatarURL() })
                    .setDescription(`${newState.member} a quitté <#${oldState.channelId}>`)
                    .setTimestamp();
                logChannel.send({ embeds: [embed] }).catch(() => {});
            }
        }
    },
};
