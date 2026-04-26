const { EmbedBuilder } = require('discord.js');
const { getSettings } = require('../src/utils/settingsManager');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        if (oldMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return;

        const settings = getSettings();
        const logChannelId = settings[oldMessage.guild.id]?.logMsgEdit;
        if (!logChannelId) return;

        const logChannel = oldMessage.guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle('Message Edited')
            .setColor('#F1C40F')
            .setAuthor({ name: oldMessage.author.tag, iconURL: oldMessage.author.displayAvatarURL() })
            .addFields(
                { name: 'Channel', value: `<#${oldMessage.channel.id}>`, inline: true },
                { name: 'Before', value: oldMessage.content || '*[No Text / Attachment]*' },
                { name: 'After', value: newMessage.content || '*[No Text / Attachment]*' }
            )
            .setFooter({ text: `ID: ${oldMessage.author.id}` })
            .setTimestamp();

        logChannel.send({ embeds: [embed] }).catch(() => {});
    },
};
