const { getLevels, saveLevels } = require("../src/utils/levelManager");
const { getSettings } = require("../src/utils/settingsManager");
const { getBadWords } = require("../src/utils/badWordsManager");
const { getEconomy, saveEconomy } = require("../src/utils/economyManager");
const { getCustomCommands } = require("../src/utils/customCommandsManager");
const textCooldowns = new Map();

module.exports = {
    name: "messageCreate",
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        const settings = await getSettings();
        const guildSettings = settings[message.guild.id] || {};

        // Auto-Mod
        if (guildSettings.autoModEnabled) {
            const content = message.content.toLowerCase();
            const badWords = await getBadWords();
            const guildWords = badWords[message.guild.id] || [];
            if (guildWords.length > 0 && guildWords.some(word => content.includes(word.toLowerCase()))) {
                await message.delete();
                return message.channel.send(`${message.author}, attention au langage !`).then(m => setTimeout(() => m.delete(), 3000));
            }
        }

        // Passive Economy
        const coinsPerMsg = guildSettings.coinsPerMessage || 0;
        if (coinsPerMsg > 0) {
            const now = Date.now();
            const lastReward = textCooldowns.get(message.author.id) || 0;
            if (now - lastReward > 60000) {
                textCooldowns.set(message.author.id, now);
                const economy = await getEconomy();
                if (!economy[message.author.id]) economy[message.author.id] = { balance: 0 };
                economy[message.author.id].balance += coinsPerMsg;
                await saveEconomy(economy);
            }
        }

        // Custom Commands
        const prefix = "^^^";
        if (message.content.startsWith(prefix)) {
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift()?.toLowerCase();
            if (commandName) {
                const customCommands = await getCustomCommands();
                const guildCmds = customCommands[message.guild.id] || {};
                if (guildCmds[commandName]) {
                    const cmdData = guildCmds[commandName];
                    const replyOptions = {};
                    if (cmdData.text) replyOptions.content = cmdData.text;
                    if (cmdData.image && cmdData.image.trim() !== "") {
                        const img = cmdData.image.trim();
                        if (img.startsWith("http")) {
                            replyOptions.content = (replyOptions.content ? replyOptions.content + "\n" : "") + img;
                        } else {
                            replyOptions.files = [img];
                        }
                    }
                    if (Object.keys(replyOptions).length > 0) {
                        return message.channel.send(replyOptions).catch(() => {});
                    }
                }
            }
        }

        // Leveling
        const levels = await getLevels();
        if (!levels[message.guild.id]) levels[message.guild.id] = {};
        if (!levels[message.guild.id][message.author.id]) levels[message.guild.id][message.author.id] = { xp: 0, level: 0 };
        const userStats = levels[message.guild.id][message.author.id];
        userStats.xp += Math.floor(Math.random() * 10) + 15;
        const nextLevelXP = (userStats.level + 1) * 500;
        if (userStats.xp >= nextLevelXP) {
            userStats.level++;
            const { createLevelUpCard } = require("../src/utils/canvasGenerator");
            const { AttachmentBuilder } = require("discord.js");
            try {
                const buffer = await createLevelUpCard(message.member, userStats.level);
                const attachment = new AttachmentBuilder(buffer, { name: "levelup.png" });
                const levelChannelId = guildSettings.levelUpChannel || message.channel.id;
                const targetChannel = message.guild.channels.cache.get(levelChannelId) || message.channel;
                targetChannel.send({ content: `GG ${message.author}! Niveau **${userStats.level}** !`, files: [attachment] });
            } catch (e) {
                message.channel.send(`GG ${message.author}! Niveau **${userStats.level}** !`);
            }
        }
        await saveLevels(levels);
    }
};
