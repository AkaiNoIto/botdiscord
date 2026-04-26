const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const { getSettings } = require('../utils/settingsManager');

async function handleButton(interaction, client) {
    const { customId, guild, user } = interaction;

    if (customId === 'ticket_create') {
        const settings = getSettings()[guild.id] || {};
        
        // Find existing ticket to prevent spam
        const existingChannel = guild.channels.cache.find(c => c.topic === user.id && c.name.startsWith('ticket-'));
        if (existingChannel) {
            return interaction.reply({ content: `❌ You already have an open ticket: ${existingChannel}`, ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        // Setup permissions
        const permissionOverwrites = [
            {
                id: guild.id, // @everyone
                deny: [PermissionFlagsBits.ViewChannel],
            },
            {
                id: user.id, // Ticket creator
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
            },
            {
                id: client.user.id, // Bot
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ReadMessageHistory],
            }
        ];

        // Add Support Role if configured
        if (settings.ticketAdminRole) {
            permissionOverwrites.push({
                id: settings.ticketAdminRole,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
            });
        }

        // Create Channel
        try {
            const ticketChannel = await guild.channels.create({
                name: `ticket-${user.username}`,
                type: ChannelType.GuildText,
                parent: settings.ticketCategory || null,
                topic: user.id, // Store their ID in the topic
                permissionOverwrites: permissionOverwrites
            });

            const embed = new EmbedBuilder()
                .setTitle('Ticket Support')
                .setDescription(`Welcome ${user}! Please describe your issue. Support staff will be with you shortly.`)
                .setColor('#2ECC71');

            const closeButton = new ButtonBuilder()
                .setCustomId('ticket_close')
                .setLabel('🔒 Close Ticket')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(closeButton);

            let pingMsg = `${user}`;
            if (settings.ticketAdminRole) {
                pingMsg += ` <@&${settings.ticketAdminRole}>`;
            }

            await ticketChannel.send({ content: pingMsg, embeds: [embed], components: [row] });
            return interaction.followUp({ content: `✅ Ticket created: ${ticketChannel}` });
            
        } catch (error) {
            console.error("Error creating ticket:", error);
            return interaction.followUp({ content: `❌ Failed to create ticket. Make sure I have permissions to manage channels.` });
        }
    }

    if (customId === 'ticket_close') {
        const settings = getSettings()[guild.id] || {};
        
        await interaction.reply({ content: `🔒 Ticket is being closed and saved. Please wait...` });

        const channel = interaction.channel;
        const ownerId = channel.topic;
        
        try {
            // Generate Transcript
            const messages = await channel.messages.fetch({ limit: 100 });
            const orderedMessages = Array.from(messages.values()).reverse();
            
            let transcript = `TRANSCRIPT - ${channel.name}\n`;
            transcript += `Server: ${guild.name} | Closed by: ${user.tag}\n`;
            transcript += `Date: ${new Date().toISOString()}\n`;
            transcript += `-------------------------------------------------\n\n`;

            orderedMessages.forEach(msg => {
                if (msg.author) {
                    transcript += `[${new Date(msg.createdTimestamp).toUTCString()}] ${msg.author.tag}: ${msg.content || '[Embed/Attachment]'}\n`;
                }
            });

            const buffer = Buffer.from(transcript, 'utf-8');
            const attachment = new AttachmentBuilder(buffer, { name: `${channel.name}-transcript.txt` });

            // DM Owner
            if (ownerId) {
                try {
                    const owner = await client.users.fetch(ownerId);
                    if (owner) {
                        await owner.send({ 
                            content: `Your ticket on **${guild.name}** has been closed. Here is your transcript:`,
                            files: [attachment]
                        });
                    }
                } catch (e) {
                    console.log("Could not DM ticket owner transcripts.");
                }
            }

            // Send to Logs
            if (settings.ticketLogChannel) {
                const logChannel = guild.channels.cache.get(settings.ticketLogChannel);
                if (logChannel) {
                    await logChannel.send({ 
                        content: `🔒 **Ticket Closed**\n**Channel:** ${channel.name}\n**Closed By:** ${user}`,
                        files: [attachment]
                    }).catch(()=>{});
                }
            }

            // Delete channel
            setTimeout(() => {
                channel.delete().catch(()=>{});
            }, 5000); // 5 sec wait to read the "being closed" message
            
        } catch (error) {
            console.error("Error closing ticket:", error);
            return interaction.followUp({ content: `❌ Error closing ticket.` });
        }
    }
}

module.exports = { handleButton };
