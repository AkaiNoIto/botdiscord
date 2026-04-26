const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getBadWords, saveBadWords } = require('../../src/utils/badWordsManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Paramètres de modération automatique')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        // /automod badword add
        .addSubcommandGroup(group =>
            group.setName('badword')
                .setDescription('Gérer les mots interdits')
                .addSubcommand(sub => 
                    sub.setName('add')
                        .setDescription('Ajouter un mot à la liste noire')
                        .addStringOption(opt => opt.setName('word').setDescription('Mot à bloquer').setRequired(true)))
                .addSubcommand(sub => 
                    sub.setName('remove')
                        .setDescription('Retirer un mot de la liste noire')
                        .addStringOption(opt => opt.setName('word').setDescription('Mot à débloquer').setRequired(true)))
                .addSubcommand(sub => 
                    sub.setName('list')
                        .setDescription('Lister tous les mots interdits'))),

    async execute(interaction) {
        const group = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        let badWords = getBadWords();
        if (!badWords[guildId]) badWords[guildId] = [];

        if (group === 'badword') {
            if (subcommand === 'add') {
                const word = interaction.options.getString('word').toLowerCase();
                if (!badWords[guildId].includes(word)) {
                    badWords[guildId].push(word);
                    saveBadWords(badWords);
                }
                return interaction.reply(`✅ Le mot **${word}** a été ajouté à la liste noire.`);
            }

            if (subcommand === 'remove') {
                const word = interaction.options.getString('word').toLowerCase();
                badWords[guildId] = badWords[guildId].filter(w => w !== word);
                saveBadWords(badWords);
                return interaction.reply(`✅ Le mot **${word}** a été retiré de la liste noire.`);
            }

            if (subcommand === 'list') {
                const list = badWords[guildId].join(', ') || 'Aucun mot dans la liste noire.';
                return interaction.reply(`🚫 **Mots Interdits :**\n${list}`);
            }
        }
    },
};
