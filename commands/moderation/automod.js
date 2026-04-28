const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { getBadWords, saveBadWords } = require("../../src/utils/badWordsManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("automod")
        .setDescription("Parametres de moderation automatique")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommandGroup(group => group.setName("badword").setDescription("Gerer les mots interdits")
            .addSubcommand(sub => sub.setName("add").setDescription("Ajouter un mot").addStringOption(opt => opt.setName("word").setDescription("Mot a bloquer").setRequired(true)))
            .addSubcommand(sub => sub.setName("remove").setDescription("Retirer un mot").addStringOption(opt => opt.setName("word").setDescription("Mot a debloquer").setRequired(true)))
            .addSubcommand(sub => sub.setName("list").setDescription("Lister les mots interdits"))),

    async execute(interaction) {
        const group = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        let badWords = await getBadWords();
        if (!badWords[guildId]) badWords[guildId] = [];

        if (group === "badword") {
            if (subcommand === "add") {
                const word = interaction.options.getString("word").toLowerCase();
                if (!badWords[guildId].includes(word)) {
                    badWords[guildId].push(word);
                    await saveBadWords(badWords);
                }
                return interaction.editReply(`Le mot **${word}** a ete ajoute a la liste noire.`);
            }
            if (subcommand === "remove") {
                const word = interaction.options.getString("word").toLowerCase();
                badWords[guildId] = badWords[guildId].filter(w => w !== word);
                await saveBadWords(badWords);
                return interaction.editReply(`Le mot **${word}** a ete retire.`);
            }
            if (subcommand === "list") {
                const list = badWords[guildId].join(", ") || "Aucun mot dans la liste noire.";
                return interaction.editReply(`**Mots Interdits :**\n${list}`);
            }
        }
    }
};

