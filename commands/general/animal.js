const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('animal')
        .setDescription('Get a random picture of a cat or dog.')
        .addStringOption(opt => 
            opt.setName('type')
                .setDescription('Cat or Dog?')
                .setRequired(true)
                .addChoices({ name: 'Cat', value: 'cat' }, { name: 'Dog', value: 'dog' })),
    async execute(interaction) {
        const type = interaction.options.getString('type');
        const url = type === 'cat' ? 'https://api.thecatapi.com/v1/images/search' : 'https://dog.ceo/api/breeds/image/random';

        try {
            const response = await axios.get(url);
            const imageUrl = type === 'cat' ? response.data[0].url : response.data.message;

            const embed = new EmbedBuilder()
                .setTitle(`Here is a cute ${type}! 🐾`)
                .setImage(imageUrl)
                .setColor('#FEE75C');

            return interaction.reply({ embeds: [embed] });
        } catch (e) {
            return interaction.reply({ content: 'Could not fetch animal picture.', ephemeral: true });
        }
    },
};
