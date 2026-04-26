const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Lancez un dé à 6 faces !'),
    async execute(interaction) {
        const result = Math.floor(Math.random() * 6) + 1;
        await interaction.reply(`🎲 Vous avez obtenu un : **${result}** !`);
    },
};
