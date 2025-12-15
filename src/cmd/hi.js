const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder().setName('hi').setDescription('Nothing to see'),
    async execute(interaction) {
        await interaction.reply("hey")
    },
}