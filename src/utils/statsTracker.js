const fs = require('fs');
const path = require('path');
const { getEconomy } = require('./economyManager');

const statsPath = path.join(__dirname, '../data/stats.json');

const getStats = () => {
    try {
        if (!fs.existsSync(statsPath)) return { history: [] };
        const data = fs.readFileSync(statsPath, 'utf8');
        return data ? JSON.parse(data) : { history: [] };
    } catch { return { history: [] }; }
};

const saveStats = (data) => {
    fs.writeFileSync(statsPath, JSON.stringify(data, null, 4));
};

const trackStats = (client) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const stats = getStats();

    // Avoid multiple tracks per day
    if (stats.history.length > 0 && stats.history[stats.history.length - 1].date === dateStr) return;

    let totalMembers = 0;
    let totalCoins = 0;
    const economy = getEconomy();

    client.guilds.cache.forEach(guild => {
        totalMembers += guild.memberCount;
        if (economy[guild.id]) {
            Object.values(economy[guild.id]).forEach(user => {
                totalCoins += user.coins || 0;
            });
        }
    });

    stats.history.push({
        date: dateStr,
        members: totalMembers,
        wealth: totalCoins
    });

    // Keep only last 30 days
    if (stats.history.length > 30) stats.history.shift();

    saveStats(stats);
    console.log(`📊 Stats tracked for ${dateStr}: ${totalMembers} members, ${totalCoins} coins total.`);
};

module.exports = { getStats, trackStats };
