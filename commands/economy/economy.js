const { SlashCommandBuilder } = require('discord.js');
const { getEconomy, saveEconomy } = require('../../src/utils/economyManager');
const { getShop } = require('../../src/utils/shopManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('economy')
        .setDescription('Gérez vos pièces et les articles de la boutique')
        // /economy balance
        .addSubcommand(sub => 
            sub.setName('balance')
                .setDescription('Vérifiez votre solde ou celui d\'un autre utilisateur')
                .addUserOption(opt => opt.setName('target').setDescription('L\'utilisateur à vérifier')))
        // /economy daily
        .addSubcommand(sub => sub.setName('daily').setDescription('Réclamez vos pièces quotidiennes'))
        // /economy work
        .addSubcommand(sub => sub.setName('work').setDescription('Travaillez pour gagner des pièces'))
        // /economy shop
        .addSubcommand(sub => sub.setName('shop').setDescription('Parcourir la boutique du serveur'))
        // /economy buy
        .addSubcommand(sub => 
            sub.setName('buy')
                .setDescription('Achetez un article dans la boutique')
                .addStringOption(opt => opt.setName('item').setDescription('Nom de l\'article').setRequired(true)))
        // /economy blackjack
        .addSubcommand(sub =>
            sub.setName('blackjack')
                .setDescription('Jouez une partie de Blackjack contre le croupier')
                .addIntegerOption(opt => opt.setName('bet').setDescription('Montant à parier').setRequired(true).setMinValue(1)))
        // /economy coinflip
        .addSubcommand(sub =>
            sub.setName('coinflip')
                .setDescription('Lancez une pièce pour doubler votre mise')
                .addIntegerOption(opt => opt.setName('bet').setDescription('Montant à parier').setRequired(true).setMinValue(1))
                .addStringOption(opt => opt.setName('side').setDescription('Choisissez votre côté').setRequired(true).addChoices(
                    { name: 'Pile', value: 'heads' },
                    { name: 'Face', value: 'tails' }
                )))
        // /economy buy-pub
        .addSubcommand(sub => sub.setName('buy-pub').setDescription('Achetez ou rechargez votre rôle Publicitaire')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        const userId = (interaction.options.getUser('target') || interaction.user).id;
        let economy = getEconomy();

        // Ensure user exists in economy
        if (!economy[guildId]) economy[guildId] = {};
        if (!economy[guildId][userId]) economy[guildId][userId] = { coins: 0, lastDaily: 0, lastWork: 0, inventory: [] };

        // SUBCOMMAND: BALANCE
        if (subcommand === 'balance') {
            const user = interaction.options.getUser('target') || interaction.user;
            return interaction.reply(`${user.username} a **${economy[guildId][userId].coins}** coins. 🪙`);
        }

        // SUBCOMMAND: DAILY
        if (subcommand === 'daily') {
            const now = Date.now();
            const cooldown = 24 * 60 * 60 * 1000;
            const lastDaily = economy[guildId][interaction.user.id].lastDaily || 0;

            if (now - lastDaily < cooldown) {
                const remaining = cooldown - (now - lastDaily);
                const hours = Math.floor(remaining / (60 * 60 * 1000));
                return interaction.reply({ content: `Attendez encore **${hours}h** avant de réclamer à nouveau !`, ephemeral: true });
            }

            const amount = 500;
            economy[guildId][interaction.user.id].coins += amount;
            economy[guildId][interaction.user.id].lastDaily = now;
            saveEconomy(economy);
            return interaction.reply(`🎁 Vous avez réclamé vos **${amount}** coins quotidiens !`);
        }

        // SUBCOMMAND: WORK
        if (subcommand === 'work') {
            const now = Date.now();
            const cooldown = 60 * 60 * 1000; // 1 hour
            const lastWork = economy[guildId][interaction.user.id].lastWork || 0;

            if (now - lastWork < cooldown) {
                return interaction.reply({ content: 'Doucement ! Vous ne pouvez travailler qu\'une fois par heure.', ephemeral: true });
            }

            const amount = Math.floor(Math.random() * 200) + 50;
            const jobs = ['Livreur de Pizza', 'Développeur', 'Modérateur Discord', 'Streamer', 'Agriculteur'];
            const job = jobs[Math.floor(Math.random() * jobs.length)];

            economy[guildId][interaction.user.id].coins += amount;
            economy[guildId][interaction.user.id].lastWork = now;
            saveEconomy(economy);
            return interaction.reply(`💼 Vous avez travaillé comme **${job}** et gagné **${amount}** coins !`);
        }

        // SUBCOMMAND: SHOP
        if (subcommand === 'shop') {
            const shop = getShop()[guildId] || [];
            if (shop.length === 0) return interaction.reply('La boutique est actuellement vide.');
            
            const list = shop.map(item => `**${item.name}**: ${item.price} coins \n*${item.description}* (Stock: ${item.stock === -1 ? '∞' : item.stock})`).join('\n\n');
            return interaction.reply(`🏪 **Boutique du Serveur**\n\n${list}`);
        }

        // SUBCOMMAND: BUY
        if (subcommand === 'buy') {
            const itemName = interaction.options.getString('item');
            const shop = getShop()[guildId] || [];
            const item = shop.find(i => i.name.toLowerCase() === itemName.toLowerCase());

            if (!item) return interaction.reply('Article non trouvé dans la boutique.');
            if (economy[guildId][interaction.user.id].coins < item.price) return interaction.reply('Vous n\'avez pas assez de coins !');
            if (item.stock !== -1 && item.stock <= 0) return interaction.reply('Article en rupture de stock !');

            // Deduct coins
            economy[guildId][interaction.user.id].coins -= item.price;
            
            // Give role if exists
            if (item.roleId) {
                const role = interaction.guild.roles.cache.get(item.roleId);
                if (role) await interaction.member.roles.add(role).catch(() => {});
            }

            // Update Stock
            if (item.stock !== -1) {
                const fullShop = getShop();
                const itemIndex = fullShop[guildId].findIndex(i => i.name === item.name);
                fullShop[guildId][itemIndex].stock -= 1;
                const { saveShop } = require('../../src/utils/shopManager');
                saveShop(fullShop);
            }

            saveEconomy(economy);
            return interaction.reply(`🛍️ Vous avez acheté **${item.name}** pour **${item.price}** coins !`);
        }

        // SUBCOMMAND: COINFLIP
        if (subcommand === 'coinflip') {
            const bet = interaction.options.getInteger('bet');
            const side = interaction.options.getString('side');

            if (economy[guildId][interaction.user.id].coins < bet) {
                return interaction.reply({ content: 'Vous n\'avez pas assez de coins !', ephemeral: true });
            }

            const result = Math.random() < 0.5 ? 'heads' : 'tails';
            const win = side === result;
            const resultLabel = result === 'heads' ? 'PILE' : 'FACE';

            if (win) {
                economy[guildId][interaction.user.id].coins += bet;
                saveEconomy(economy);
                return interaction.reply(`🪙 La pièce est tombée sur **${resultLabel}** ! Vous avez gagné **${bet}** coins ! 💰`);
            } else {
                economy[guildId][interaction.user.id].coins -= bet;
                saveEconomy(economy);
                return interaction.reply(`🪙 La pièce est tombée sur **${resultLabel}**... Vous avez perdu **${bet}** coins. 💸`);
            }
        }

        // SUBCOMMAND: BLACKJACK
        if (subcommand === 'blackjack') {
            const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
            const bet = interaction.options.getInteger('bet');
            
            if (economy[guildId][interaction.user.id].coins < bet) {
                return interaction.reply({ content: 'Vous n\'avez pas assez de coins !', ephemeral: true });
            }

            // Simple Card Logic
            const deck = [];
            const suits = ['♠️', '♥️', '♣️', '♦️'];
            const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
            for (const s of suits) for (const v of values) deck.push({ value: v, suit: s });

            const draw = () => deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
            const getVal = (hand) => {
                let v = 0, aces = 0;
                hand.forEach(c => {
                    if (['J', 'Q', 'K'].includes(c.value)) v += 10;
                    else if (c.value === 'A') { v += 11; aces++; }
                    else v += parseInt(c.value);
                });
                while (v > 21 && aces > 0) { v -= 10; aces--; }
                return v;
            };

            const playerHand = [draw(), draw()];
            const dealerHand = [draw(), draw()];

            const createEmbed = (isDone = false) => {
                const embed = new EmbedBuilder()
                    .setTitle('🃏 Table de Blackjack')
                    .setDescription(`Mise : **${bet}** coins`)
                    .addFields(
                        { name: `Votre Main (${getVal(playerHand)})`, value: playerHand.map(c => `[${c.value}${c.suit}]`).join(' '), inline: true },
                        { name: `Main du Croupier (${isDone ? getVal(dealerHand) : '?'})`, value: isDone ? dealerHand.map(c => `[${c.value}${c.suit}]`).join(' ') : `[${dealerHand[0].value}${dealerHand[0].suit}] [?]`, inline: true }
                    )
                    .setColor('#F1C40F');
                return embed;
            };

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('bj_hit').setLabel('Tirer').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('bj_stand').setLabel('Rester').setStyle(ButtonStyle.Secondary)
            );

            const msg = await interaction.reply({ embeds: [createEmbed()], components: [row] });
            const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 60000 });

            collector.on('collect', async i => {
                if (i.customId === 'bj_hit') {
                    playerHand.push(draw());
                    if (getVal(playerHand) > 21) {
                        economy[guildId][interaction.user.id].coins -= bet;
                        saveEconomy(economy);
                        collector.stop('bust');
                        return i.update({ embeds: [createEmbed(true).setDescription(`💥 **Busted !** Vous avez dépassé 21. Perte de ${bet} coins.`)], components: [] });
                    }
                    return i.update({ embeds: [createEmbed()] });
                }

                if (i.customId === 'bj_stand') {
                    while (getVal(dealerHand) < 17) dealerHand.push(draw());
                    const pVal = getVal(playerHand);
                    const dVal = getVal(dealerHand);
                    
                    let resultMsg = "";
                    if (dVal > 21 || pVal > dVal) {
                        economy[guildId][interaction.user.id].coins += bet;
                        resultMsg = `🏆 **Gagné !** Vous avez remporté ${bet} coins.`;
                    } else if (pVal < dVal) {
                        economy[guildId][interaction.user.id].coins -= bet;
                        resultMsg = `💀 **Le croupier gagne.** Vous avez perdu ${bet} coins.`;
                    } else {
                        resultMsg = "⚖️ **Égalité !** Votre mise a été rendue.";
                    }
                    
                    saveEconomy(economy);
                    collector.stop('done');
                    return i.update({ embeds: [createEmbed(true).setDescription(resultMsg)], components: [] });
                }
            });
        }

        // SUBCOMMAND: BUY-PUB
        if (subcommand === 'buy-pub') {
            const { getSettings } = require('../../src/utils/settingsManager');
            const { getAdData, saveAdData } = require('../../src/utils/adSystemManager');
            const settings = getSettings()[guildId] || {};
            const adData = getAdData();

            if (!settings.adChannelId || !settings.adRoleId) {
                return interaction.reply({ content: '❌ Le système de publicité n\'est pas configuré sur ce serveur.', ephemeral: true });
            }

            if (!adData[guildId]) adData[guildId] = {};
            
            const hasBoughtBefore = adData[guildId][interaction.user.id] === true;
            const price = hasBoughtBefore ? (settings.adRechargePrice || 0) : (settings.adInitialPrice || 0);

            if (economy[guildId][interaction.user.id].coins < price) {
                return interaction.reply({ content: `❌ Vous avez besoin de **${price}** coins pour ${hasBoughtBefore ? 'recharger' : 'acheter'} ce rôle.`, ephemeral: true });
            }

            const role = interaction.guild.roles.cache.get(settings.adRoleId);
            if (!role) return interaction.reply({ content: '❌ Erreur : Le rôle publicitaire n\'existe plus.', ephemeral: true });

            if (interaction.member.roles.cache.has(role.id)) {
                return interaction.reply({ content: '💡 Vous avez déjà le rôle publicitaire ! Utilisez-le d\'abord dans le salon dédié.', ephemeral: true });
            }

            // Pay
            economy[guildId][interaction.user.id].coins -= price;
            saveEconomy(economy);

            // Give Role
            await interaction.member.roles.add(role).catch(e => {
                console.error("Error adding ad role:", e);
                return interaction.reply({ content: '❌ Je n\'ai pas pu vous donner le rôle. Veuillez vérifier mes permissions.', ephemeral: true });
            });

            // Mark as buyer
            if (!hasBoughtBefore) {
                adData[guildId][interaction.user.id] = true;
                saveAdData(adData);
            }

            return interaction.reply(`✅ Vous avez ${hasBoughtBefore ? 'rechargé' : 'acheté'} avec succès le rôle publicitaire pour **${price}** coins ! Vous pouvez maintenant poster un message dans <#${settings.adChannelId}>.`);
        }
    },
};
