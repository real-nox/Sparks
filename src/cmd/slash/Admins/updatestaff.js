import { SlashCommandBuilder, MessageFlags, EmbedBuilder } from "discord.js";
import { Print } from "../../../handler/extraHandler.js";
import { CmdError, ErrorLog } from "../../../systems/LogSystem.js";
import ServerDB from "../../../data/ServerDB.js";

export default {
    admin: true,
    cooldown: 50000,
    data: new SlashCommandBuilder()
        .setName('staff-role')
        .setDescription('Set/Update staff role in order to give them permission to use staff commands.')
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('Put your staff role here!')
                .setRequired(true)
        ),
    async execute(interaction) {
        try {
            const guild = interaction.guild;
            let roleId = interaction.options.getRole('role').id;

            const staffUpdateEmbed = new EmbedBuilder().setTitle("Staff update").setTimestamp().setFooter({ text: `${guild.name}` })

            if (!guild.roles.cache.has(roleId)) {
                staffUpdateEmbed.setDescription("Unfound role! Use an exisiting role!").setColor("Red")
                return interaction.reply({ embeds: [staffUpdateEmbed], flags: MessageFlags.Ephemeral });
            }

            let server = new ServerDB(guild.id);

            let oldStaffR = await server.getStaffR();

            if (!oldStaffR) {
                await update()

                staffUpdateEmbed.setDescription(`Staff has been set to <@&${roleId}>`).setColor("Aqua");
                return interaction.channel.send({ embeds: [staffUpdateEmbed] })
            }

            if (oldStaffR === roleId) {
                staffUpdateEmbed.setDescription("- Cannot update role, it's already been updated with the same ID.\n> Use a new role ID").setColor("Red")
                return interaction.reply({ embeds: [staffUpdateEmbed] });
            }

            await update()
            staffUpdateEmbed.setColor("Aqua").setDescription(`- **Old staff role :** <@&${oldStaffR}>\n- **New staff role :** <@&${roleId}>`);

            return interaction.channel.send({ embeds: [staffUpdateEmbed], flags: MessageFlags.Ephemeral });

            async function update() {
                let setStaff = await server.setStaffR(roleId);

                if (!setStaff)
                    return interaction.reply({ embeds: [CmdError()], flags: MessageFlags.Ephemeral });
            }
        } catch (error) {
            Print("[STAFFCHANGE] " + error, "Red");
            ErrorLog("STAFFCHANGE", error);
        }
    }
}