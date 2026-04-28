const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mod')
        .setDescription('Actions de modération pour le staff')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        // /mod kick
        .addSubcommand(sub => 
            sub.setName('kick')
                .setDescription('Expulser un membre')
                .addUserOption(opt => opt.setName('target').setDescription('Membre à expulser').setRequired(true))
                .addStringOption(opt => opt.setName('reason').setDescription('Raison de l\'expulsion')))
        // /mod ban
        .addSubcommand(sub => 
            sub.setName('ban')
                .setDescription('Bannir un membre')
                .addUserOption(opt => opt.setName('target').setDescription('Membre à bannir').setRequired(true))
                .addStringOption(opt => opt.setName('reason').setDescription('Raison du bannissement')))
        // /mod unban
        .addSubcommand(sub => 
            sub.setName('unban')
                .setDescription('Débannir un membre par son ID')
                .addStringOption(opt => opt.setName('id').setDescription('ID de l\'utilisateur à débannir').setRequired(true)))
        // /mod clear
        .addSubcommand(sub => 
            sub.setName('clear')
                .setDescription('Supprimer un nombre de messages')
                .addIntegerOption(opt => opt.setName('amount').setDescription('Nombre de messages (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const { guild, options } = interaction;

        // SUBCOMMAND: KICK
        if (subcommand === 'kick') {
            const target = options.getMember('target');
            const reason = options.getString('reason') || 'Aucune raison fournie';
            if (!target.kickable) return interaction.editReply({ content: 'Je ne peux pas expulser cet utilisateur.', ephemeral: true });
            
            await target.kick(reason);
            return interaction.editReply(`👢 **${target.user.tag}** a été expulsé | ${reason}`);
        }

        // SUBCOMMAND: BAN
        if (subcommand === 'ban') {
            const target = options.getMember('target');
            const reason = options.getString('reason') || 'Aucune raison fournie';
            if (!target.bannable) return interaction.editReply({ content: 'Je ne peux pas bannir cet utilisateur.', ephemeral: true });
            
            await target.ban({ reason });
            return interaction.editReply(`🔨 **${target.user.tag}** a été banni | ${reason}`);
        }

        // SUBCOMMAND: UNBAN
        if (subcommand === 'unban') {
            const targetId = options.getString('id');
            await guild.members.unban(targetId);
            return interaction.editReply(`🕊️ L'utilisateur avec l'ID **${targetId}** a été débanni.`);
        }

        // SUBCOMMAND: CLEAR
        if (subcommand === 'clear') {
            const amount = options.getInteger('amount');
            await interaction.channel.bulkDelete(amount, true);
            return interaction.editReply({ content: `🧹 **${amount}** messages ont été supprimés.`, ephemeral: true });
        }
    },
};

