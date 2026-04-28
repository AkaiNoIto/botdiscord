const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getLevels } = require("../../src/utils/levelManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rank")
        .setDescription("Verifiez le niveau et XP d un utilisateur.")
        .addUserOption(opt => opt.setName("target").setDescription("Utilisateur a verifier")),
    async execute(interaction) {
        const user = interaction.options.getUser("target") || interaction.user;
        const levels = await getLevels();
        const guildLevels = levels[interaction.guild.id];
        const userStats = guildLevels ? guildLevels[user.id] : null;
        if (!userStats) return interaction.editReply({ content: `${user.username} n a pas encore gagne d XP !`, ephemeral: true });
        const embed = new EmbedBuilder()
            .setTitle(`Rang de ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .setColor("#FEE75C")
            .addFields(
                { name: "Niveau", value: `${userStats.level}`, inline: true },
                { name: "XP", value: `${userStats.xp} / ${(userStats.level + 1) * 500}`, inline: true }
            );
        return interaction.editReply({ embeds: [embed] });
    }
};

