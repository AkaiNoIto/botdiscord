const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const parseTime = (str) => {
    const match = str.match(/^(\d+)(s|m|h|d)$/);
    if (!match) return null;
    const value = parseInt(match[1]);
    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return value * multipliers[match[2]];
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Start a giveaway!')
        .addStringOption(opt => opt.setName('prize').setDescription('What are you giving away?').setRequired(true))
        .addStringOption(opt => opt.setName('duration').setDescription('Duration (e.g. 30s, 5m, 1h, 1d)').setRequired(true))
        .addIntegerOption(opt => opt.setName('winners').setDescription('Number of winners').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    
    async execute(interaction) {
        const prize = interaction.options.getString('prize');
        const durationStr = interaction.options.getString('duration');
        const winnersCount = interaction.options.getInteger('winners') || 1;
        const duration = parseTime(durationStr);

        if (!duration) {
            return interaction.editReply({ content: '⚠️ Invalid duration format! Use: `30s`, `5m`, `1h`, `2d`', ephemeral: true });
        }

        const endTime = Date.now() + duration;

        const embed = new EmbedBuilder()
            .setTitle('🎉 GIVEAWAY 🎉')
            .setDescription(`**Prize:** ${prize}\n\n React with 🎉 to enter!\n\n**Winners:** ${winnersCount}\n**Hosted by:** ${interaction.user}`)
            .setColor('#F1C40F')
            .setFooter({ text: `Ends at` })
            .setTimestamp(endTime);

        await interaction.editReply({ content: '🎉 Giveaway started!', ephemeral: true });
        const msg = await interaction.channel.send({ embeds: [embed] });
        await msg.react('🎉');

        // Wait for giveaway to end
        setTimeout(async () => {
            try {
                const fetchedMsg = await interaction.channel.messages.fetch(msg.id);
                const reaction = fetchedMsg.reactions.cache.get('🎉');
                if (!reaction) {
                    return interaction.channel.send('🎉 Giveaway ended but no one entered!');
                }

                const users = await reaction.users.fetch();
                const participants = users.filter(u => !u.bot);

                if (participants.size === 0) {
                    return interaction.channel.send('🎉 Giveaway ended but no one entered!');
                }

                const participantArray = Array.from(participants.values());
                const selectedWinners = [];
                const pool = [...participantArray];

                for (let i = 0; i < Math.min(winnersCount, pool.length); i++) {
                    const idx = Math.floor(Math.random() * pool.length);
                    selectedWinners.push(pool.splice(idx, 1)[0]);
                }

                const winnerMentions = selectedWinners.map(u => `<@${u.id}>`).join(', ');

                const endEmbed = new EmbedBuilder()
                    .setTitle('🎉 GIVEAWAY ENDED 🎉')
                    .setDescription(`**Prize:** ${prize}\n\n**Winner(s):** ${winnerMentions}\n**Hosted by:** ${interaction.user}`)
                    .setColor('#57F287')
                    .setTimestamp();

                await fetchedMsg.edit({ embeds: [endEmbed] });
                interaction.channel.send(`🎉 Congratulations ${winnerMentions}! You won **${prize}**!`);
            } catch (e) {
                console.error('Giveaway error:', e);
            }
        }, duration);
    },
};

