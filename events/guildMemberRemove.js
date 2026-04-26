const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { getSettings } = require("../src/utils/settingsManager");
const { createWelcomeCard } = require("../src/utils/canvasGenerator");

module.exports = {
    name: "guildMemberRemove",
    async execute(member) {
        const settings = await getSettings();
        const guildSettings = settings[member.guild.id];
        if (!guildSettings) return;

        // Canal de depart
        const channelId = guildSettings.leaveChannel || guildSettings.welcomeChannel || member.guild.systemChannelId;
        if (!channelId) return;
        const channel = member.guild.channels.cache.get(channelId);
        if (!channel) return;

        let leaveMessage = guildSettings.leaveMessage || "**{user}** a quitté le serveur. Bonne continuation !";
        leaveMessage = leaveMessage.replace(/{user}/g, member.user.tag).replace(/{guild}/g, member.guild.name);

        try {
            const buffer = await createWelcomeCard(member);
            const attachment = new AttachmentBuilder(buffer, { name: "goodbye.png" });
            channel.send({ content: leaveMessage, files: [attachment] });
        } catch (e) {
            channel.send(leaveMessage);
        }
    }
};
