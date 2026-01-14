const { Client, MessageFlags, EmbedBuilder } = require("discord.js");
const { Print } = require("../handler/extraHandler");
const { ErrorLog } = require("../handler/logsHanlder");
const { getStaffR } = require("../data/ServerDB");

module.exports = {
    name: "interactionCreate",

    /**
    * @param {import("discord.js").Interaction} interaction;
    */
    async eventrun(client = Client, interaction) {
        try {
            const { commandName } = interaction;

            const command = client.commands.get(commandName);

            //Cooldown
            if (command.cooldown) {
                let cooldownUntil = client.cooldowns.get(`${command.name}-${interaction.user.id}`);
                if (cooldownUntil && cooldownUntil > Date.now()) {
                    return await interaction.reply({content : `Command is on cooldown for ${Math.ceil((cooldownUntil - Date.now()) / 1000)} secs`, flags : MessageFlags.Ephemeral })
                }

                client.cooldowns.set(`${command.name}-${interaction.user.id}`, new Date().valueOf() + command.cooldown);
            }

            //Owner
            if (command.owner)
                if (interaction.user.id != "432592303450882064") return;

            //Admin
            if (command.admin)
                if (!interaction.member.permissions.has("Administrator")) {
                    const permbed = new EmbedBuilder()
                        .setDescription("```You are not an admin to use this command!```").setColor("Red");
                    return interaction.reply({ embeds: [permbed], flags : MessageFlags.Ephemeral });
                }

            //Staff
            if (command.staff)
                if (!interaction.member.permissions.has("Administrator") && !interaction.member.permissions.has("ManageMessages") && !interaction.member.roles.cache.has((await getStaffR(DB, interaction.guild.id))[0].staffRID || '0')) {
                    const permbed = new EmbedBuilder()
                        .setDescription("```You are not a staff to use this command!```").setColor("Red");
                    return interaction.reply({ embeds: [permbed], flags : MessageFlags.Ephemeral });
                }
            if (interaction.isChatInputCommand()) {
                command.execute(interaction, client);
            }
        } catch (error) {
            Print("[ERROR] " + error, "Red");
            ErrorLog("Interaction", error);
        }
    }
}