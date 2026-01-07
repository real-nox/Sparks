const { Client, MessageFlags } = require("discord.js");
const { Print } = require("../handler/extraHandler");
const { ErrorLog } = require("../handler/logsHanlder");

module.exports = {
    name: "interactionCreate",

    /**
    * @param {import("discord.js").Interaction} interaction;
    */
    async eventrun(client = Client, interaction) {
        try {
            const { commandName, options } = interaction;

            const command = client.commands.get(commandName);

            if (command.cooldown) {
                let cooldownUntil = client.cooldowns.get(`${command.name}-${interaction.user.id}`);
                if (cooldownUntil && cooldownUntil > Date.now()) {
                    return await interaction.reply({content : `Command is on cooldown for ${Math.ceil((cooldownUntil - Date.now()) / 1000)} secs`, flags : MessageFlags.Ephemeral })
                }

                client.cooldowns.set(`${command.name}-${interaction.user.id}`, new Date().valueOf() + command.cooldown);
            }

            if (interaction.isChatInputCommand()) {
                command.execute(interaction);
            }
        } catch (error) {
            Print("[ERROR] " + error, "Red");
            ErrorLog("Interaction", error);
        }
    }
}