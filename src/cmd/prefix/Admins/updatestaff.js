import { EmbedBuilder } from "discord.js"
import { Print } from "../../../handler/extraHandler.js"
import { CmdError, ErrorLog } from "../../../systems/LogSystem.js";
import ServerDB from "../../../data/ServerDB.js";

export default {
    name: "staff-role",
    admin: true,
    cooldown: 50000,
    async prerun(mg) {
        try {
            const guild = mg.guild;
            let roleID = (mg.content.split(" "))[1];

            const staffUpdateEmbed = new EmbedBuilder().setTitle("Staff update").setTimestamp().setFooter({ text: `${guild.name}` })

            if (!guild.roles.cache.has(roleID)) {
                staffUpdateEmbed.setDescription("Unfound role! Use an exisiting roleid!").setColor("Red")
                return mg.reply({ embeds: [staffUpdateEmbed] });
            }

            let server = new ServerDB(guild.id)

            let oldStaffR = await server.getStaffR();

            if (!oldStaffR) {
                await update()

                staffUpdateEmbed.setDescription(`Staff has been set to <@&${roleID}>`).setColor("Aqua");
                return mg.channel.send({ embeds: [staffUpdateEmbed] })
            }

            if (oldStaffR === roleID) {
                staffUpdateEmbed.setDescription("- Cannot update role, it's already been updated with the same ID.\n> Use a new role ID").setColor("Red")
                return mg.reply({ embeds: [staffUpdateEmbed] });
            }

            await update()
            staffUpdateEmbed.setColor("Aqua").setDescription(`- **Old staff role :** <@&${oldStaffR}>\n- **New staff role :** <@&${roleID}>`);

            return mg.channel.send({ embeds: [staffUpdateEmbed] });

            async function update() {
                let setStaff = await server.setStaffR(roleID);

                if (!setStaff)
                    return mg.reply({ embeds: [CmdError()] });
            }
        } catch (error) {
            Print("[STAFFCHANGE] " + error, "Red");
            ErrorLog("STAFFCHANGE", error);
        }
    },
}