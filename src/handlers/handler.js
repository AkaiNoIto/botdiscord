const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

module.exports = (client) => {
    // Command Handler
    const commands = [];
    const commandFolders = fs.readdirSync(path.join(__dirname, '../../commands'));
    
    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(path.join(__dirname, `../../commands/${folder}`)).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(path.join(__dirname, `../../commands/${folder}/${file}`));
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        }
    }

    // Event Handler
    const eventFiles = fs.readdirSync(path.join(__dirname, '../../events')).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(path.join(__dirname, `../../events/${file}`));
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }

    // Register Slash Commands
    client.once('clientReady', async () => {
        const { updateBotStatus } = require('../utils/botStatusUpdater');
        
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        try {
            console.log('Started refreshing application (/) commands.');
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );
            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
        console.log(`${client.user.tag} is online!`);

        // Initial status and stats update
        updateBotStatus(client);
        
        try {
            const { trackStats } = require('../utils/statsTracker');
            trackStats(client);
            setInterval(() => trackStats(client), 24 * 60 * 60 * 1000);
        } catch (e) {
            console.error('Stats tracking error:', e);
        }
        
        // Keep status fresh
        setInterval(() => updateBotStatus(client), 60000);

        // Events to track guild changes
        client.on('guildCreate', () => updateBotStatus(client));
        client.on('guildDelete', () => updateBotStatus(client));
    });
};
