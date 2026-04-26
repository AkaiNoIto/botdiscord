const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche des informations sur toutes les commandes catégorisées.'),
    async execute(interaction) {
        const categories = {
            general: { 
                emoji: '🌍', 
                name: 'Général', 
                description: 'Commandes utilitaires et amusantes.',
                commands: [
                    '**/help**: Affiche ce menu d\'aide',
                    '**/ping**: Vérifie la latence du bot',
                    '**/giveaway**: Gère les concours sur le serveur',
                    '**/avatar**: Affiche l\'avatar d\'un utilisateur',
                    '**/serverinfo**: Affiche les détails du serveur',
                    '**/userinfo**: Affiche les détails d\'un utilisateur',
                    '**/ask**: Posez une question à l\'IA'
                ]
            },
            music: { 
                emoji: '🎵', 
                name: 'Musique', 
                description: 'Contrôles de lecture audio.',
                commands: [
                    '**/music play**: Cherche et joue de la musique',
                    '**/music stop**: Arrête et vide la file d\'attente',
                    '**/music skip**: Passe à la chanson suivante',
                    '**/music queue**: Affiche les chansons à venir',
                    '**/music nowplaying**: Détails de la chanson actuelle',
                    '**/music pause/resume**: Contrôle de la lecture',
                    '**/music volume**: Règle le niveau sonore'
                ]
            },
            economy: { 
                emoji: '💰', 
                name: 'Économie', 
                description: 'Pièces, jeux de casino et boutique.',
                commands: [
                    '**/economy balance**: Vérifie ton solde de pièces',
                    '**/economy shop**: Parcoure la boutique d\'objets',
                    '**/economy buy**: Achète un objet en boutique',
                    '**/economy blackjack**: Joue aux cartes contre le croupier',
                    '**/economy coinflip**: Parie sur pile ou face',
                    '**/economy daily**: Réclame ta récompense quotidienne',
                    '**/economy work**: Gagne des pièces en travaillant',
                    '**/economy buy-pub**: Achetez ou rechargez votre rôle Publicitaire'
                ]
            },
            moderation: { 
                emoji: '🛡️', 
                name: 'Modération', 
                description: 'Gestion du serveur et sécurité.',
                commands: [
                    '**/mod kick/ban**: Expulse ou bannit des membres',
                    '**/mod clear**: Supprime des messages en masse',
                    '**/automod badword**: Gère les mots interdits',
                    '**/automod toggle**: Active/Désactive l\'Auto-Mod',
                    '*Note : Toutes les configurations (Logs, Bienvenue, etc.) se font sur le site Dashboard.*'
                ]
            }
        };

        const embed = new EmbedBuilder()
            .setTitle('Nexus Door - Centre d\'Aide')
            .setDescription('Sélectionnez une catégorie ci-dessous pour voir les commandes détaillées. Toutes les commandes sont regroupées par dossiers !')
            .setColor('#3498DB')
            .addFields(
                { name: '📂 Comment utiliser ?', value: 'Tapez `/` suivi du nom de la catégorie (ex: `/music`) pour voir toutes les sous-options.' }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL());

        const select = new StringSelectMenuBuilder()
            .setCustomId('help_category')
            .setPlaceholder('Choisissez une catégorie...')
            .addOptions(Object.keys(categories).map(key => ({
                label: categories[key].name,
                description: categories[key].description,
                value: key,
                emoji: categories[key].emoji
            })));

        const row = new ActionRowBuilder().addComponents(select);

        const response = await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

        const collector = response.createMessageComponentCollector({ time: 120000 });

        collector.on('collect', async i => {
            if (i.customId === 'help_category') {
                try {
                    const category = i.values[0];
                    const data = categories[category];

                    const catEmbed = new EmbedBuilder()
                        .setTitle(`${data.emoji} Catégorie ${data.name}`)
                        .setDescription(`Voici les commandes disponibles dans le groupe **/${category}** :\n\n${data.commands.join('\n')}`)
                        .setColor('#2ECC71')
                        .setFooter({ text: 'Écosystème Nexus Door' });

                    await i.update({ embeds: [catEmbed] });
                } catch (err) {
                    console.error('Help interaction error:', err);
                    if (!i.replied && !i.deferred) await i.reply({ content: 'Une erreur est survenue lors de la mise à jour du menu.', ephemeral: true });
                }
            }
        });
    }
};
