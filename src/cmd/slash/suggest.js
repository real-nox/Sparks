const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { SuggestionLog, ErrorLog } = require("../../handler/logsHanlder");
const { Print } = require("../../handler/extraHandler");
const { profanity } = require("@2toad/profanity");

module.exports = {
    cooldown : 50000,
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('Send your suggestion to the owner of the bot!')
        .addStringOption(options =>
            options
                .setName('suggestion')
                .setDescription("Write your suggestion here.")
                .setMinLength(10)
                .setRequired(true)
        ),
    async execute(interaction) {
        try {
            const suggestion = interaction.options.getString('suggestion');

            if (profanity.exists(suggestion)) return await interaction.reply({ content: "Your suggestion contains bad words.", flags : MessageFlags.Ephemeral });

            if (SuggestionLog(interaction.user.username, suggestion)) {
                await interaction.reply({ content: "Suggestion has been successfully seen!", flags : MessageFlags.Ephemeral });
            };
        } catch (err) {
            ErrorLog("SUGGESTION", err);
            Print("[SUGGESTION]", err);
        }
    },
}