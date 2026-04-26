const { EmbedBuilder } = require('discord.js');
const { getSettings } = require('../src/utils/settingsManager');

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        if (message.author?.bot) return;

        const settings = getSettings();
        const logChannelId = settings[message.guild.id]?.logMsgDelete;
        if (!logChannelId) return;

        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle('Message Deleted')
            .setColor('#ED4245')
            .addFields(
                { name: 'Author', value: `${message.author.tag} (${message.author.id})`, inline: true },
                { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
                { name: 'Content', value: message.content || '*No content (possibly an embed or attachment)*' }
            )
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    },
};
