const { getLevels, saveLevels } = require('../src/utils/levelManager');
const { getSettings } = require('../src/utils/settingsManager');
const fs = require('fs');
const path = require('path');

const badWordsPath = path.join(__dirname, '../src/data/badwords.json');
const getBadWords = () => {
    try {
        return JSON.parse(fs.readFileSync(badWordsPath, 'utf8') || '{}');
    } catch { return {}; }
};

const { getEconomy, saveEconomy } = require('../src/utils/economyManager');
const textCooldowns = new Map(); // Simple in-memory cooldown cache userId -> timestamp

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        const settings = getSettings();
        const guildSettings = settings[message.guild.id] || {};

        // 📝 Sent Messages Log
        if (guildSettings.logMsgSend && message.channel.id !== guildSettings.logMsgSend) {
            const logChannel = message.guild.channels.cache.get(guildSettings.logMsgSend);
            if (logChannel) {
                const { EmbedBuilder } = require('discord.js');
                const embed = new EmbedBuilder()
                    .setTitle('Message Sent')
                    .setColor('#3498DB')
                    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                    .addFields(
                        { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
                        { name: 'Content', value: message.content || '*[No Text / Attachment]*' }
                    )
                    .setFooter({ text: `ID: ${message.author.id}` })
                    .setTimestamp();
                logChannel.send({ embeds: [embed] }).catch(()=>{});
            }
        }

        // 📢 Ad System: Remove role after posting
        if (guildSettings.adChannelId && guildSettings.adRoleId && message.channel.id === guildSettings.adChannelId) {
            if (message.member.roles.cache.has(guildSettings.adRoleId)) {
                await message.member.roles.remove(guildSettings.adRoleId).catch(e => console.error("Error removing ad role:", e));
                console.log(`[AdSystem] Removed role from ${message.author.tag} after posting in ${message.channel.name}`);
                
                // Notify the user they need to recharge
                message.reply({ 
                    content: `📢 **Publicité enregistrée !** Votre rôle a été consommé. Pour poster une nouvelle pub, vous devez recharger avec la commande \`/economy buy-pub\`.`,
                }).then(m => setTimeout(() => m.delete().catch(()=>{}), 10000)).catch(()=>{});
            }
        }

        // 🛡️ Auto-Mod
        if (guildSettings.autoModEnabled) {
            const content = message.content.toLowerCase();
            const guildWords = getBadWords()[message.guild.id] || [];
            if (guildWords.length > 0 && guildWords.some(word => content.includes(word.toLowerCase()))) {
                await message.delete();
                return message.channel.send(`${message.author}, watch your language!`).then(m => setTimeout(() => m.delete(), 3000));
            }
        }

        // 💰 Passive Economy (Text Messages)
        const coinsPerMsg = guildSettings.coinsPerMessage || 0;
        if (coinsPerMsg > 0) {
            const now = Date.now();
            const lastReward = textCooldowns.get(message.author.id) || 0;
            // 1 minute cooldown to prevent spam farming
            if (now - lastReward > 60000) {
                textCooldowns.set(message.author.id, now);
                const economy = getEconomy();
                if (!economy[message.author.id]) economy[message.author.id] = { balance: 0 };
                economy[message.author.id].balance += coinsPerMsg;
                saveEconomy(economy);
            }
        }

        // 🏷️ Custom Commands
        const prefix = "^^^";
        if (message.content.startsWith(prefix)) {
            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift()?.toLowerCase();
            if (commandName) {
                const { getCustomCommands } = require('../src/utils/customCommandsManager');
                const customCommands = getCustomCommands();
                const guildCmds = customCommands[message.guild.id] || {};
                
                if (guildCmds[commandName]) {
                    const cmdData = guildCmds[commandName];
                    const { AttachmentBuilder } = require('discord.js');
                    const replyOptions = {};
                    
                    console.log(`[CustomCmd] Executing ${commandName} for guild ${message.guild.id}`);
                    console.log(`[CustomCmd] Data:`, cmdData);

                    if (cmdData.text) replyOptions.content = cmdData.text;
                    
                    if (cmdData.image && cmdData.image.trim() !== "") {
                        const img = cmdData.image.trim();
                        // If it's a URL, just append it to the content to let Discord embed it (avoids upload limits)
                        if (img.startsWith('http')) {
                            replyOptions.content = (replyOptions.content ? replyOptions.content + "\n" : "") + img;
                            console.log(`[CustomCmd] URL appended to content: ${img}`);
                        } else {
                            // Local file: use AttachmentBuilder
                            try {
                                replyOptions.files = [img];
                                console.log(`[CustomCmd] Local file attached: ${img}`);
                            } catch (e) {
                                console.error("[CustomCmd] Local file error:", e);
                            }
                        }
                    }
                    
                    if (Object.keys(replyOptions).length > 0) {
                        return message.channel.send(replyOptions)
                            .then(() => console.log(`[CustomCmd] Success: ${commandName}`))
                            .catch(e => {
                                console.error("[CustomCmd] Send Error:", e);
                                if (cmdData.text) message.channel.send(cmdData.text).catch(() => {});
                            });
                    }
                }
            }
        }


        // 📈 Leveling (only if enabled for this guild)
        if (guildSettings.levelingEnabled === false) {
            saveLevels(getLevels()); // still save but skip xp gain
            return;
        }

        const levels = getLevels();
        if (!levels[message.guild.id]) levels[message.guild.id] = {};
        if (!levels[message.guild.id][message.author.id]) {
            levels[message.guild.id][message.author.id] = { xp: 0, level: 0 };
        }

        const userStats = levels[message.guild.id][message.author.id];
        userStats.xp += Math.floor(Math.random() * 10) + 15;

        const nextLevelXP = (userStats.level + 1) * 500;
        if (userStats.xp >= nextLevelXP) {
            userStats.level++;
            
            const { createLevelUpCard } = require('../src/utils/canvasGenerator');
            const { AttachmentBuilder } = require('discord.js');

            try {
                const buffer = await createLevelUpCard(message.member, userStats.level);
                const attachment = new AttachmentBuilder(buffer, { name: 'levelup.png' });
                
                const levelChannelId = guildSettings.levelUpChannel || message.channel.id;
                const targetChannel = message.guild.channels.cache.get(levelChannelId) || message.channel;

                targetChannel.send({ 
                    content: `GG ${message.author}! You've reached **Level ${userStats.level}**! 🚀`,
                    files: [attachment] 
                });
            } catch (e) {
                console.error('Level card error:', e);
                message.channel.send(`Congratulations ${message.author}! You've reached **Level ${userStats.level}**! 🎉`);
            }
        }

        saveLevels(levels);
    },
};
