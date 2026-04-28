const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Get a random meme from Reddit.'),
    async execute(interaction) {
        try {
            const response = await axios.get('https://meme-api.com/gimme');
            const { title, url, postLink, subreddit } = response.data;

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setURL(postLink)
                .setImage(url)
                .setColor('#FF4500')
                .setFooter({ text: `From r/${subreddit}` });

            return interaction.editReply({ embeds: [embed] });
        } catch (e) {
            return interaction.editReply({ content: 'Could not fetch a meme at the moment.', ephemeral: true });
        }
    },
};

