const { Client } = require("discord.js");
const { ErrorLog } = require("../handler/extraHandler");

module.exports = {
    name: "interactionCreate",

    /**
    * @param {import("discord.js").Interaction} interaction;
    */
    async eventrun(client = Client, interaction) {
        try {
            const { commandName } = interaction;

            if (interaction.isChatInputCommand()) {
                const command = client.commands.get(commandName);

                command.execute(interaction);
            }
        } catch (error) {
            Print("[ERROR] " + error, "Red");
            ErrorLog("Interaction", error);
        }
    }
}