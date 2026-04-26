const { getSettings } = require('../src/utils/settingsManager');
const { createWelcomeCard } = require('../src/utils/canvasGenerator');
const { AttachmentBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const settings = getSettings();
        const guildSettings = settings[member.guild.id];
        
        const channelId = guildSettings?.welcomeChannel || member.guild.systemChannelId;
        if (!channelId) return;

        const channel = member.guild.channels.cache.get(channelId);
        if (!channel) return;

        let welcomeMessage = guildSettings?.welcomeMessage || "Bienvenue sur le serveur, {user} ! Nous sommes ravis de vous accueillir ! 🎉";
        
        // Placeholders
        welcomeMessage = welcomeMessage.replace(/{user}/g, member.toString());
        welcomeMessage = welcomeMessage.replace(/{guild}/g, member.guild.name);

        try {
            const buffer = await createWelcomeCard(member);
            const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
            channel.send({ content: welcomeMessage, files: [attachment] });
        } catch (e) {
            console.error('Canvas error:', e);
            channel.send(welcomeMessage);
        }
    },
};
