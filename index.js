require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Player } = require('discord-player');
const { SoundCloudExtractor, AttachmentExtractor } = require('@discord-player/extractor');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
    ]
});

const { updateBotStatus } = require('./src/utils/botStatusUpdater');
const { trackStats } = require('./src/utils/statsTracker');

// Setup Music Player
client.player = new Player(client, {
    skipFFmpeg: false,
    leaveOnEnd: false,
    leaveOnEmpty: true,
    leaveOnEmptyCooldown: 10000,
});

client.commands = new Collection();

// Global error handling
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Main startup function
async function main() {
    try {
        console.log('⏳ Loading music extractors...');
        await client.player.extractors.register(SoundCloudExtractor, {});
        await client.player.extractors.register(AttachmentExtractor, {});
        console.log('✅ Music extractors loaded successfully!');
    } catch (e) {
        console.error('❌ Failed to load extractors:', e);
    }

    // Command and Event Handlers
    const functionsPath = path.join(__dirname, 'src/handlers');
    const functionFiles = fs.readdirSync(functionsPath).filter(file => file.endsWith('.js'));

    for (const file of functionFiles) {
        require(path.join(functionsPath, file))(client);
    }

    // Start Internal Music API
    require('./src/utils/musicApi')(client);

    // Player Events for Debugging
    client.player.events.on('error', (queue, error) => {
        console.error(`[Player Error] Error emitted from the queue: ${error.message}`);
    });
    client.player.events.on('playerError', (queue, error) => {
        console.error(`[Player Error] Error emitted from the player: ${error.message}`);
    });
    client.player.events.on('disconnect', (queue) => {
        console.log('❌ Disconnected from the voice channel.');
    });
    client.player.events.on('playerStart', (queue, track) => {
        console.log(`▶️ Started playing: ${track.title}`);
    });

    client.login(process.env.DISCORD_TOKEN);
}

main();
