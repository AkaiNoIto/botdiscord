const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription("Get a user's avatar.")
        .addUserOption(opt => opt.setName('target').setDescription('The user to get the avatar of')),
    async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Avatar`)
            .setImage(user.displayAvatarURL({ size: 1024 }))
            .setColor('#5865F2');

        return interaction.reply({ embeds: [embed] });
    },
};
