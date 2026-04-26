const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Get the weather for a city.')
        .addStringOption(opt => opt.setName('city').setDescription('The city name').setRequired(true)),
    async execute(interaction) {
        const city = interaction.options.getString('city');
        
        try {
            // Using wttr.in for a simple free API without keys for now
            const response = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
            const data = response.data.current_condition[0];
            
            const embed = new EmbedBuilder()
                .setTitle(`Weather in ${city}`)
                .setColor('#3498DB')
                .addFields(
                    { name: 'Temperature', value: `${data.temp_C}°C`, inline: true },
                    { name: 'Condition', value: data.weatherDesc[0].value, inline: true },
                    { name: 'Humidity', value: `${data.humidity}%`, inline: true },
                    { name: 'Wind', value: `${data.windspeedKmph} km/h`, inline: true }
                );

            return interaction.reply({ embeds: [embed] });
        } catch (e) {
            return interaction.reply({ content: "Couldn't find that city or the service is down.", ephemeral: true });
        }
    },
};
