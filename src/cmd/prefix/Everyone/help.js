const { EmbedBuilder } = require("discord.js")

module.exports = {
    name: "help",
    async prerun(mg) {
        const helpEmbed = new EmbedBuilder()
            .setTitle("Commands List - Help")
        await mg.reply({ embeds: [helpEmbed] })
    }
}