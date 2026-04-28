const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Jouez à Pierre-Papier-Ciseaux avec le bot !')
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Votre choix')
                .setRequired(true)
                .addChoices(
                    { name: 'Pierre', value: 'rock' },
                    { name: 'Papier', value: 'paper' },
                    { name: 'Ciseaux', value: 'scissors' }
                )),
    async execute(interaction) {
        const choices = ['rock', 'paper', 'scissors'];
        const userChoice = interaction.options.getString('choice');
        const botChoice = choices[Math.floor(Math.random() * choices.length)];

        const labels = { 'rock': 'Pierre', 'paper': 'Papier', 'scissors': 'Ciseaux' };

        let result = '';
        if (userChoice === botChoice) {
            result = "C'est une égalité !";
        } else if (
            (userChoice === 'rock' && botChoice === 'scissors') ||
            (userChoice === 'paper' && botChoice === 'rock') ||
            (userChoice === 'scissors' && botChoice === 'paper')
        ) {
            result = 'Vous avez gagné !';
        } else {
            result = 'J\'ai gagné !';
        }

        await interaction.editReply(`Vous avez choisi **${labels[userChoice]}**, j'ai choisi **${labels[botChoice]}**. ${result}`);
    },
};

