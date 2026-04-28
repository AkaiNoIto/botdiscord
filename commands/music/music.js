const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer, useQueue } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Centre de contrôle musical universel')
        .addSubcommand(sub =>
            sub.setName('play')
                .setDescription('Jouer une chanson depuis SoundCloud')
                .addStringOption(opt => opt.setName('query').setDescription('Nom de la chanson ou URL SoundCloud').setRequired(true)))
        .addSubcommand(sub => sub.setName('stop').setDescription('Arrêter la musique et vider la file d\'attente'))
        .addSubcommand(sub => sub.setName('skip').setDescription('Passer à la chanson suivante'))
        .addSubcommand(sub => sub.setName('nowplaying').setDescription('Afficher ce qui est en cours de lecture'))
        .addSubcommand(sub => sub.setName('queue').setDescription('Afficher la file d\'attente actuelle'))
        .addSubcommand(sub => sub.setName('pause').setDescription('Mettre la musique en pause'))
        .addSubcommand(sub => sub.setName('resume').setDescription('Reprendre la musique'))
        .addSubcommand(sub =>
            sub.setName('volume')
                .setDescription('Changer le volume')
                .addIntegerOption(opt => opt.setName('amount').setDescription('0-100').setRequired(true).setMinValue(0).setMaxValue(100))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const player = useMainPlayer();
        const guildId = interaction.guild.id;
        const queue = useQueue(guildId);

        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.editReply({ content: 'Vous devez être dans un salon vocal !', ephemeral: true });

        // SUBCOMMAND: PLAY
        if (subcommand === 'play') {
            const query = interaction.options.getString('query');
            await interaction.deferReply();

            try {
                const { track } = await player.play(channel, query, {
                    searchEngine: 'soundcloudSearch',
                    nodeOptions: {
                        metadata: interaction,
                        leaveOnEnd: false,
                        leaveOnEmpty: true,
                        leaveOnEmptyCooldown: 10000,
                        selfDeafen: true,
                    }
                });
                const extractor = track.extractor?.identifier || 'Inconnue';
                return interaction.followUp(`🎶 **${track.title}** (${track.duration})\n✅ Ajouté à la file | Source: **${extractor.toUpperCase()}**`);
            } catch (e) {
                return interaction.followUp(`Quelque chose s'est mal passé : ${e.message}`);
            }
        }

        // Check if queue exists for other commands
        if (!queue || !queue.isPlaying()) {
            return interaction.editReply({ content: 'Aucune musique n\'est en cours de lecture !', ephemeral: true });
        }

        // SUBCOMMAND: STOP
        if (subcommand === 'stop') {
            queue.delete();
            return interaction.editReply('🛑 Musique arrêtée et file d\'attente vidée.');
        }

        // SUBCOMMAND: SKIP
        if (subcommand === 'skip') {
            const currentTrack = queue.currentTrack;
            queue.node.skip();
            return interaction.editReply(`⏩ Passage de **${currentTrack.title}**`);
        }

        // SUBCOMMAND: NOWPLAYING
        if (subcommand === 'nowplaying') {
            const track = queue.currentTrack;
            const progress = queue.node.createProgressBar();
            const source = track.extractor?.identifier || 'Inconnue';
            return interaction.editReply(`🎶 **En cours de lecture :**\n**${track.title}** par **${track.author}**\n\n${progress}\n\nSource: **${source.toUpperCase()}** | Durée : **${track.duration}**`);
        }

        // SUBCOMMAND: QUEUE
        if (subcommand === 'queue') {
            const tracks = queue.tracks.toArray().slice(0, 10);
            const list = tracks.map((t, i) => `${i + 1}. **${t.title}**`).join('\n') || 'La file d\'attente est vide.';
            return interaction.editReply(`📋 **Prochaines pistes :**\n${list}`);
        }

        // SUBCOMMAND: PAUSE
        if (subcommand === 'pause') {
            queue.node.setPaused(true);
            return interaction.editReply('⏸️ Musique en pause.');
        }

        // SUBCOMMAND: RESUME
        if (subcommand === 'resume') {
            queue.node.setPaused(false);
            return interaction.editReply('▶️ Musique reprise.');
        }

        // SUBCOMMAND: VOLUME
        if (subcommand === 'volume') {
            const amount = interaction.options.getInteger('amount');
            queue.node.setVolume(amount);
            return interaction.editReply(`🔊 Volume réglé à **${amount}%**`);
        }
    },
};

