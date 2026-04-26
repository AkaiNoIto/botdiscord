const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer, useQueue } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Centre de contrôle musical universel')
        // /music play
        .addSubcommand(sub => 
            sub.setName('play')
                .setDescription('Jouer une chanson depuis YouTube ou SoundCloud')
                .addStringOption(opt => opt.setName('query').setDescription('Nom de la chanson ou URL').setRequired(true))
                .addStringOption(opt => opt.setName('source').setDescription('Où chercher').addChoices(
                    { name: 'YouTube', value: 'youtube' },
                    { name: 'SoundCloud', value: 'soundcloud' }
                )))
        // /music stop
        .addSubcommand(sub => sub.setName('stop').setDescription('Arrêter la musique et vider la file d\'attente'))
        // /music skip
        .addSubcommand(sub => sub.setName('skip').setDescription('Passer à la chanson suivante'))
        // /music nowplaying
        .addSubcommand(sub => sub.setName('nowplaying').setDescription('Afficher ce qui est en cours de lecture'))
        // /music queue
        .addSubcommand(sub => sub.setName('queue').setDescription('Afficher la file d\'attente actuelle'))
        // /music pause
        .addSubcommand(sub => sub.setName('pause').setDescription('Mettre la musique en pause'))
        // /music resume
        .addSubcommand(sub => sub.setName('resume').setDescription('Reprendre la musique'))
        // /music volume
        .addSubcommand(sub => 
            sub.setName('volume')
                .setDescription('Changer le volume')
                .addIntegerOption(opt => opt.setName('amount').setDescription('0-100').setRequired(true).setMinValue(0).setMaxValue(100))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const player = useMainPlayer();
        const guildId = interaction.guild.id;
        const queue = useQueue(guildId);

        // Common voice check
        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.reply({ content: 'Vous devez être dans un salon vocal !', ephemeral: true });

        // SUBCOMMAND: PLAY
        if (subcommand === 'play') {
            let query = interaction.options.getString('query');
            let source = interaction.options.getString('source') || 'auto';
            await interaction.deferReply();

            // Smart detection in query
            if (query.toLowerCase().endsWith(' sc') || query.toLowerCase().endsWith(' soundcloud')) {
                source = 'soundcloud';
                query = query.replace(/ (sc|soundcloud)$/i, '');
            }

            let searchEngine = 'auto';
            if (source === 'youtube') searchEngine = 'youtubeSearch';
            if (source === 'soundcloud') searchEngine = 'soundcloudSearch';

            let finalQuery = query;
            if (query.includes('youtube.com/watch') || query.includes('youtu.be/')) {
                try {
                    const url = new URL(query);
                    const listId = url.searchParams.get('list');
                    if (listId && listId.startsWith('RD') && url.searchParams.has('v')) {
                        finalQuery = `https://www.youtube.com/watch?v=${url.searchParams.get('v')}`;
                    }
                } catch (err) {}
            }

            try {
                const { track } = await player.play(channel, finalQuery, {
                    searchEngine: searchEngine,
                    nodeOptions: { metadata: interaction }
                });
                const extractor = track.extractor?.identifier || 'Inconnue';
                return interaction.followUp(`🎶 **${track.title}** (${track.duration})\n✅ Ajouté à la file | Source: **${extractor.toUpperCase()}**`);
            } catch (e) {
                return interaction.followUp(`Quelque chose s'est mal passé : ${e.message}`);
            }
        }

        // Check if queue exists for other commands
        if (!queue || !queue.isPlaying()) {
            if (subcommand !== 'play') return interaction.reply({ content: 'Aucune musique n\'est en cours de lecture !', ephemeral: true });
        }

        // SUBCOMMAND: STOP
        if (subcommand === 'stop') {
            queue.delete();
            return interaction.reply('🛑 Musique arrêtée et file d\'attente vidée.');
        }

        // SUBCOMMAND: SKIP
        if (subcommand === 'skip') {
            const currentTrack = queue.currentTrack;
            queue.node.skip();
            return interaction.reply(`⏩ Passage de **${currentTrack.title}**`);
        }

        // SUBCOMMAND: NOWPLAYING
        if (subcommand === 'nowplaying') {
            const track = queue.currentTrack;
            const progress = queue.node.createProgressBar();
            const source = track.extractor?.identifier || 'Inconnue';
            return interaction.reply(`🎶 **En cours de lecture :**\n**${track.title}** par **${track.author}**\n\n${progress}\n\nSource: **${source.toUpperCase()}** | Durée : **${track.duration}**`);
        }

        // SUBCOMMAND: QUEUE
        if (subcommand === 'queue') {
            const tracks = queue.tracks.toArray().slice(0, 10);
            const list = tracks.map((t, i) => `${i + 1}. **${t.title}**`).join('\n') || 'La file d\'attente est vide.';
            return interaction.reply(`📋 **Prochaines pistes :**\n${list}`);
        }

        // SUBCOMMAND: PAUSE
        if (subcommand === 'pause') {
            queue.node.setPaused(true);
            return interaction.reply('⏸️ Musique en pause.');
        }

        // SUBCOMMAND: RESUME
        if (subcommand === 'resume') {
            queue.node.setPaused(false);
            return interaction.reply('▶️ Musique reprise.');
        }

        // SUBCOMMAND: VOLUME
        if (subcommand === 'volume') {
            const amount = interaction.options.getInteger('amount');
            queue.node.setVolume(amount);
            return interaction.reply(`🔊 Volume réglé à **${amount}%**`);
        }
    },
};
