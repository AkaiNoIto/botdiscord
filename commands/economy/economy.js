const { SlashCommandBuilder } = require("discord.js");
const { getEconomy, saveEconomy } = require("../../src/utils/economyManager");
const { getShop, saveShop } = require("../../src/utils/shopManager");
const { getSettings } = require("../../src/utils/settingsManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("economy")
        .setDescription("Gerez vos pieces et les articles de la boutique")
        .addSubcommand(sub => sub.setName("balance").setDescription("Verifiez votre solde").addUserOption(opt => opt.setName("target").setDescription("Utilisateur a verifier")))
        .addSubcommand(sub => sub.setName("daily").setDescription("Reclamez vos pieces quotidiennes"))
        .addSubcommand(sub => sub.setName("work").setDescription("Travaillez pour gagner des pieces"))
        .addSubcommand(sub => sub.setName("shop").setDescription("Parcourir la boutique"))
        .addSubcommand(sub => sub.setName("buy").setDescription("Achetez un article").addStringOption(opt => opt.setName("item").setDescription("Nom de larticle").setRequired(true)))
        .addSubcommand(sub => sub.setName("blackjack").setDescription("Jouez au Blackjack").addIntegerOption(opt => opt.setName("bet").setDescription("Montant a parier").setRequired(true).setMinValue(1)))
        .addSubcommand(sub => sub.setName("coinflip").setDescription("Lancez une piece").addIntegerOption(opt => opt.setName("bet").setDescription("Montant a parier").setRequired(true).setMinValue(1)).addStringOption(opt => opt.setName("side").setDescription("Choisissez votre cote").setRequired(true).addChoices({ name: "Pile", value: "heads" }, { name: "Face", value: "tails" }))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        const userId = (interaction.options.getUser("target") || interaction.user).id;
        let economy = await getEconomy();

        if (!economy[userId]) economy[userId] = { balance: 0, lastDaily: 0, lastWork: 0 };

        if (subcommand === "balance") {
            const user = interaction.options.getUser("target") || interaction.user;
            return interaction.reply(`${user.username} a **${economy[userId]?.balance || 0}** coins.`);
        }

        if (subcommand === "daily") {
            const now = Date.now();
            const cooldown = 24 * 60 * 60 * 1000;
            const myId = interaction.user.id;
            if (!economy[myId]) economy[myId] = { balance: 0, lastDaily: 0, lastWork: 0 };
            const lastDaily = economy[myId].lastDaily || 0;
            if (now - lastDaily < cooldown) {
                const hours = Math.floor((cooldown - (now - lastDaily)) / (60 * 60 * 1000));
                return interaction.reply({ content: `Attendez encore **${hours}h** !`, ephemeral: true });
            }
            economy[myId].balance += 500;
            economy[myId].lastDaily = now;
            await saveEconomy(economy);
            return interaction.reply("Vous avez reclame vos **500** coins quotidiens !");
        }

        if (subcommand === "work") {
            const now = Date.now();
            const myId = interaction.user.id;
            if (!economy[myId]) economy[myId] = { balance: 0, lastDaily: 0, lastWork: 0 };
            if (now - (economy[myId].lastWork || 0) < 3600000) return interaction.reply({ content: "Attendez 1h avant de retravailler.", ephemeral: true });
            const amount = Math.floor(Math.random() * 200) + 50;
            const jobs = ["Livreur", "Developpeur", "Moderateur", "Streamer", "Agriculteur"];
            economy[myId].balance += amount;
            economy[myId].lastWork = now;
            await saveEconomy(economy);
            return interaction.reply(`Vous avez travaille comme **${jobs[Math.floor(Math.random() * jobs.length)]}** et gagne **${amount}** coins !`);
        }

        if (subcommand === "shop") {
            const shop = await getShop();
            const items = shop[guildId] || [];
            const allSettings = await getSettings();
            const guildSettings = allSettings[guildId] || {};

            let list = "";

            if (items.length > 0) {
                list += items.map(i => `**${i.name}** — ${i.price} coins\n${i.description} (Stock: ${i.stock === -1 ? "8" : i.stock})`).join("\n\n");
            }

            if (guildSettings.adRoleId && guildSettings.adInitialPrice) {
                const role = interaction.guild.roles.cache.get(guildSettings.adRoleId);
                const roleName = role ? role.name : "Role Publicitaire";
                const member = interaction.guild.members.cache.get(interaction.user.id);
                const hasRole = member?.roles.cache.has(guildSettings.adRoleId);
                const price = hasRole ? (guildSettings.adRechargePrice || guildSettings.adInitialPrice) : guildSettings.adInitialPrice;
                const label = hasRole ? "Recharge" : "Premier achat";
                if (list) list += "\n\n";
                list += `**${roleName}** — ${price} coins *(${label})*\nPermet de poster vos publicites dans le salon dedie.\nAchetez avec \`/economy buy item:role pub\``;
            }

            if (!list) return interaction.reply("La boutique est vide.");
            return interaction.reply(`**?? Boutique**\n\n${list}`);
        }

        if (subcommand === "buy") {
            const myId = interaction.user.id;
            const itemName = interaction.options.getString("item").toLowerCase();
            const allSettings = await getSettings();
            const guildSettings = allSettings[guildId] || {};

            if (guildSettings.adRoleId && itemName.includes("pub")) {
                if (!economy[myId]) economy[myId] = { balance: 0 };
                const member = await interaction.guild.members.fetch(myId);
                const hasRole = member?.roles.cache.has(guildSettings.adRoleId);
                const price = hasRole ? (guildSettings.adRechargePrice || guildSettings.adInitialPrice) : guildSettings.adInitialPrice;

                if (!price || price <= 0) return interaction.reply({ content: "Le role publicitaire n'est pas configure correctement.", ephemeral: true });
                if (economy[myId].balance < price) return interaction.reply({ content: `Pas assez de coins ! Il vous faut **${price}** coins.`, ephemeral: true });

                economy[myId].balance -= price;
                await saveEconomy(economy);

                const role = interaction.guild.roles.cache.get(guildSettings.adRoleId);
                if (role && member) await member.roles.add(role).catch(() => {});

                if (guildSettings.adChannelId) {
                    const adChannel = interaction.guild.channels.cache.get(guildSettings.adChannelId);
                    if (adChannel) await adChannel.send(`?? **${interaction.user.username}** a achete le role publicitaire et peut maintenant poster ses pubs ici !`);
                }

                return interaction.reply(`? Vous avez achete le **Role Publicitaire** pour **${price}** coins ! ${hasRole ? "*(Recharge)*" : ""}`);
            }

            const shop = await getShop();
            const items = shop[guildId] || [];
            const item = items.find(i => i.name.toLowerCase() === itemName);
            if (!item) return interaction.reply({ content: "Article non trouve. Tapez le nom exact depuis `/economy shop`.", ephemeral: true });
            if (!economy[myId]) economy[myId] = { balance: 0 };
            if (economy[myId].balance < item.price) return interaction.reply("Pas assez de coins !");
            if (item.stock !== -1 && item.stock <= 0) return interaction.reply("Article en rupture de stock !");
            economy[myId].balance -= item.price;
            if (item.roleId) {
                const role = interaction.guild.roles.cache.get(item.roleId);
                if (role) await interaction.member.roles.add(role).catch(() => {});
            }
            if (item.stock !== -1) {
                const idx = shop[guildId].findIndex(i => i.name === item.name);
                shop[guildId][idx].stock -= 1;
                await saveShop(shop);
            }
            await saveEconomy(economy);
            return interaction.reply(`Vous avez achete **${item.name}** pour **${item.price}** coins !`);
        }

        if (subcommand === "coinflip") {
            const myId = interaction.user.id;
            const bet = interaction.options.getInteger("bet");
            const side = interaction.options.getString("side");
            if (!economy[myId]) economy[myId] = { balance: 0 };
            if (economy[myId].balance < bet) return interaction.reply({ content: "Pas assez de coins !", ephemeral: true });
            const result = Math.random() < 0.5 ? "heads" : "tails";
            const win = side === result;
            economy[myId].balance += win ? bet : -bet;
            await saveEconomy(economy);
            return interaction.reply(`La piece est tombee sur **${result === "heads" ? "PILE" : "FACE"}** ! Vous avez ${win ? "gagne" : "perdu"} **${bet}** coins !`);
        }

        if (subcommand === "blackjack") {
            const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
            const myId = interaction.user.id;
            const bet = interaction.options.getInteger("bet");
            if (!economy[myId]) economy[myId] = { balance: 0 };
            if (economy[myId].balance < bet) return interaction.reply({ content: "Pas assez de coins !", ephemeral: true });
            const deck = [];
            const suits = ["S", "H", "C", "D"];
            const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
            for (const s of suits) for (const v of values) deck.push({ value: v, suit: s });
            const draw = () => deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
            const getVal = (hand) => {
                let v = 0, aces = 0;
                hand.forEach(c => {
                    if (["J","Q","K"].includes(c.value)) v += 10;
                    else if (c.value === "A") { v += 11; aces++; }
                    else v += parseInt(c.value);
                });
                while (v > 21 && aces > 0) { v -= 10; aces--; }
                return v;
            };
            const playerHand = [draw(), draw()];
            const dealerHand = [draw(), draw()];
            const createEmbed = (isDone = false) => new EmbedBuilder()
                .setTitle("Blackjack")
                .addFields(
                    { name: `Votre Main (${getVal(playerHand)})`, value: playerHand.map(c => `[${c.value}${c.suit}]`).join(" "), inline: true },
                    { name: `Croupier (${isDone ? getVal(dealerHand) : "?"})`, value: isDone ? dealerHand.map(c => `[${c.value}${c.suit}]`).join(" ") : `[${dealerHand[0].value}] [?]`, inline: true }
                ).setColor("#F1C40F");
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("bj_hit").setLabel("Tirer").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("bj_stand").setLabel("Rester").setStyle(ButtonStyle.Secondary)
            );
            const msg = await interaction.reply({ embeds: [createEmbed()], components: [row] });
            const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === myId, time: 60000 });
            collector.on("collect", async i => {
                if (i.customId === "bj_hit") {
                    playerHand.push(draw());
                    if (getVal(playerHand) > 21) {
                        economy[myId].balance -= bet;
                        await saveEconomy(economy);
                        collector.stop();
                        return i.update({ embeds: [createEmbed(true).setDescription(`Bust ! Perte de ${bet} coins.`)], components: [] });
                    }
                    return i.update({ embeds: [createEmbed()] });
                }
                if (i.customId === "bj_stand") {
                    while (getVal(dealerHand) < 17) dealerHand.push(draw());
                    const pVal = getVal(playerHand), dVal = getVal(dealerHand);
                    let msg2 = "";
                    if (dVal > 21 || pVal > dVal) { economy[myId].balance += bet; msg2 = `Gagne ! +${bet} coins.`; }
                    else if (pVal < dVal) { economy[myId].balance -= bet; msg2 = `Perdu. -${bet} coins.`; }
                    else msg2 = "Egalite !";
                    await saveEconomy(economy);
                    collector.stop();
                    return i.update({ embeds: [createEmbed(true).setDescription(msg2)], components: [] });
                }
            });
        }
    }
};

