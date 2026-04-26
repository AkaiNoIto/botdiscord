const { isBlacklisted } = require("../src/utils/listManager");
const ticketHandler = require("../src/utils/ticketHandler");

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        if (await isBlacklisted(interaction.user.id)) {
            return interaction.reply({ content: "You are blacklisted from using this bot.", ephemeral: true });
        }
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true });
                } else {
                    await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
                }
            }
        } else if (interaction.isButton()) {
            try {
                await ticketHandler.handleButton(interaction, client);
            } catch (error) {
                console.error("Button error:", error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: "An error occurred processing the button.", ephemeral: true }).catch(() => {});
                }
            }
        }
    }
};
