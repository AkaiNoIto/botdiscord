const fs = require('fs');
const path = require('path');

const botStatusPath = path.join(__dirname, '../data/botStatus.json');

const updateBotStatus = (client) => {
    const status = {
        guilds: client.guilds.cache.size,
        guildIds: Array.from(client.guilds.cache.keys()),
        users: client.users.cache.size,
        uptime: client.uptime,
        lastUpdate: Date.now()
    };
    fs.writeFileSync(botStatusPath, JSON.stringify(status, null, 4));
};

module.exports = {
    updateBotStatus
};
