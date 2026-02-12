import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js"

export default {
    name: "help",
    aliases: ["h"],
    prerun(mg, client) {
        const helpEmbed = new EmbedBuilder()
            .setTitle("Commands List - Help")
            .setDescription(`Welcome to **${client.user.username}** Help command!\n- Here you will find many things related to this bot's games,\neconomy and more... commandes\n\n- Suggest commands/functions via \`/suggest\`\nEnjoy!`)
            .setColor("Gold")

            const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`help-select-${mg.guild.id}-${mg.channel.id}`)
            .setPlaceholder("Choose one of these categories")
            .setOptions(
                new StringSelectMenuOptionBuilder()
                .setLabel("Economy")
                .setEmoji("💰")
                .setDescription("Economy related commands.")
                .setValue("economy"),
                new StringSelectMenuOptionBuilder()
                .setLabel("Mini Games")
                .setEmoji("🏆")
                .setDescription("RGL, Guess the number and much more..")
                .setValue("minigames"),
                new StringSelectMenuOptionBuilder()
                .setLabel("Tickets")
                .setEmoji("🧾")
                .setDescription("Setup tickets, or use them")
                .setValue("tickets"),
                new StringSelectMenuOptionBuilder()
                .setLabel("Moderation")
                .setEmoji("🛡️")
                .setDescription("Find out moderation commands and their usage.")
                .setValue("moderation")
            )

        mg.reply({ embeds: [helpEmbed], components : [ new ActionRowBuilder().setComponents(selectMenu)] })
    }
}