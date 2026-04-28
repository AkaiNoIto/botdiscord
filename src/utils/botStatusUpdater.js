const { connectDB, BotStatus } = require("../models");

const statuses = [
    { type: "Watching", text: "discord.gg/3Xpqa3TrXV" },
    { type: "Watching", text: "Semper Vincere" },
    { type: "Playing", text: "Clash of Clans" },
    { type: "Watching", text: "une mise a jour de AkaiIto" }
];

let statusIndex = 0;

const rotateStatus = (client) => {
    const { ActivityType } = require("discord.js");
    const current = statuses[statusIndex % statuses.length];
    const typeMap = {
        "Watching": ActivityType.Watching,
        "Playing": ActivityType.Playing,
        "Listening": ActivityType.Listening
    };
    client.user.setPresence({
        activities: [{ name: current.text, type: typeMap[current.type] || ActivityType.Watching }],
        status: "online"
    });
    statusIndex++;
};

const updateBotStatus = async (client) => {
    await connectDB();
    const status = {
        guilds: client.guilds.cache.size,
        guildIds: Array.from(client.guilds.cache.keys()),
        users: client.users.cache.size,
        uptime: client.uptime,
        lastUpdate: Date.now()
    };
    await BotStatus.findOneAndUpdate({}, status, { upsert: true });

    // Demarrer la rotation des statuts
    rotateStatus(client);
    setInterval(() => rotateStatus(client), 30000);
};

module.exports = { updateBotStatus };