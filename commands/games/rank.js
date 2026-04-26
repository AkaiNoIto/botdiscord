const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLevels } = require('../../src/utils/levelManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription("Vérifiez le niveau et l'XP d'un utilisateur.")
        .addUserOption(opt => opt.setName('target').setDescription('L\'utilisateur à vérifier')),
    async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;
        const levels = getLevels();
        
        const guildLevels = levels[interaction.guild.id];
        const userStats = guildLevels ? guildLevels[user.id] : null;

        if (!userStats) {
            return interaction.reply({ content: `${user.username} n'a pas encore gagné d'XP !`, ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`Rang de ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .setColor('#FEE75C')
            .addFields(
                { name: 'Niveau', value: `${userStats.level}`, inline: true },
                { name: 'XP', value: `${userStats.xp} / ${(userStats.level + 1) * 500}`, inline: true }
            );

        return interaction.reply({ embeds: [embed] });
    },
};
