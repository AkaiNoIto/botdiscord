const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a poll with reactions.')
        .addStringOption(opt => opt.setName('question').setDescription('The question to ask').setRequired(true))
        .addStringOption(opt => opt.setName('option1').setDescription('Option 1').setRequired(true))
        .addStringOption(opt => opt.setName('option2').setDescription('Option 2').setRequired(true)),
    async execute(interaction) {
        const question = interaction.options.getString('question');
        const opt1 = interaction.options.getString('option1');
        const opt2 = interaction.options.getString('option2');

        const embed = new EmbedBuilder()
            .setTitle('Poll 📊')
            .setDescription(`**${question}**\n\n1️⃣ ${opt1}\n2️⃣ ${opt2}`)
            .setColor('#5865F2')
            .setFooter({ text: `Asked by ${interaction.user.tag}` });

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });
        await message.react('1️⃣');
        await message.react('2️⃣');
    },
};
