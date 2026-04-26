const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tictactoe')
        .setDescription('Jouez au Morpion avec un ami.')
        .addUserOption(opt => opt.setName('opponent').setDescription('La personne contre qui vous voulez jouer').setRequired(true)),
    async execute(interaction) {
        const opponent = interaction.options.getUser('opponent');
        if (opponent.bot || opponent.id === interaction.user.id) return interaction.reply({ content: 'Vous ne pouvez pas jouer contre un bot ou vous-même !', ephemeral: true });

        const board = Array(9).fill(null);
        let turn = interaction.user.id;

        const createBoardRows = () => {
            const rows = [];
            for (let i = 0; i < 3; i++) {
                const row = new ActionRowBuilder();
                for (let j = 0; j < 3; j++) {
                    const idx = i * 3 + j;
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`ttt_${idx}`)
                            .setLabel(board[idx] || '-')
                            .setStyle(board[idx] === 'X' ? ButtonStyle.Primary : board[idx] === 'O' ? ButtonStyle.Danger : ButtonStyle.Secondary)
                            .setDisabled(board[idx] !== null)
                    );
                }
                rows.push(row);
            }
            return rows;
        };

        const checkWinner = () => {
            const lines = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
            for (const [a, b, c] of lines) {
                if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
            }
            return board.includes(null) ? null : 'tie';
        };

        const response = await interaction.reply({
            content: `${opponent}, ${interaction.user} vous a défié au Morpion ! C'est au tour de ${interaction.user} (X).`,
            components: createBoardRows()
        });

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 300000 });

        collector.on('collect', async i => {
            if (i.user.id !== turn) return i.reply({ content: "Attendez votre tour !", ephemeral: true });
            
            const idx = parseInt(i.customId.split('_')[1]);
            board[idx] = turn === interaction.user.id ? 'X' : 'O';
            
            const winner = checkWinner();
            if (winner) {
                collector.stop();
                const text = winner === 'tie' ? "C'est une égalité !" : `🎉 <@${winner === 'X' ? interaction.user.id : opponent.id}> a gagné la partie !`;
                return i.update({ content: text, components: createBoardRows().map(r => {
                    r.components.forEach(c => c.setDisabled(true));
                    return r;
                })});
            }

            turn = turn === interaction.user.id ? opponent.id : interaction.user.id;
            await i.update({
                content: `C'est au tour de <@${turn}> (${turn === interaction.user.id ? 'X' : 'O'}).`,
                components: createBoardRows()
            });
        });
    },
};
