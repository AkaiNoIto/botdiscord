const { EmbedBuilder } = require('discord.js');
const { getSettings } = require('../src/utils/settingsManager');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        const settings = getSettings();
        const logChannelId = settings[member.guild.id]?.logChannel;
        if (!logChannelId) return;

        const logChannel = member.guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle('Member Left')
            .setColor('#FEE75C')
            .setDescription(`**${member.user.tag}** has left the server.`)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields({ name: 'ID', value: member.id })
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    },
};
