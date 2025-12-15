const { Client } = require("discord.js");

module.exports = {
    name: "interactionCreate",

    /**
    * @param {import("discord.js").Interaction} interaction
    */
    async eventrun(client = Client, interaction ) {
        try {
            const {commandName} = interaction

            if (interaction.isChatInputCommand()) {
                const command = client.commands.get(commandName)

                command.execute(interaction)
            }
                } catch (err) {
            console.error("[ERROR] : ", err)
        }
    }
}