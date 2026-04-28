const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Lancez une pièce !'),
    async execute(interaction) {
        const result = Math.random() < 0.5 ? 'Pile' : 'Face';
        await interaction.editReply(`🪙 La pièce est tombée sur : **${result}** !`);
    },
};

