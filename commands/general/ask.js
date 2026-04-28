const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('Ask the Nexus Door AI a question')
        .addStringOption(opt => opt.setName('question').setDescription('Your question').setRequired(true)),
    async execute(interaction) {
        const question = interaction.options.getString('question');
        await interaction.deferReply();

        try {
            // Simplified implementation - will use OpenAI if KEY is present, else mock.
            if (!process.env.OPENAI_API_KEY) {
                return interaction.followUp(`🤖 **AI Feedback:**\n> ${question}\n\nNexus Door: "Hi! To enable me, please add an **OPENAI_API_KEY** to your .env file. For now, I can only say that your question is very interesting!"`);
            }

            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: question }]
            }, {
                headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
            });

            const answer = response.data.choices[0].message.content;
            
            const embed = new EmbedBuilder()
                .setTitle('🤖 Nexus AI')
                .setDescription(answer.length > 2000 ? answer.slice(0, 1997) + '...' : answer)
                .setColor('#9B59B6')
                .setFooter({ text: `Question: ${question.slice(0, 50)}` });

            return interaction.followUp({ embeds: [embed] });
        } catch (e) {
            console.error(e);
            return interaction.followUp('❌ The AI is currently resting. Please check your API key.');
        }
    }
};

