import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { Print } from "../../../handler/extraHandler.js"
import { ErrorLog, incorrectformcmd } from "../../../systems/LogSystem.js";

export default {
    name: "warn",
    aliases: ["wr"],
    staff: true,
    async prerun(mg) {
        try {
            const args = mg.content.split(" ")
            let member

            const errorEmbed = (err_mg) => {
                return new EmbedBuilder().setDescription(err_mg).setColor("Red")
            }

            if (args.length <= 1 && args > 3)
                return mg.reply({ embeds: [incorrectformcmd] })

            if (args.length > 1) {
                try {
                    const user = await mg.guild.members.fetch(args[1])
                    member = user
                } catch (error) {
                    return mg.reply({ embeds: [errorEmbed("This user doesn't belong to this server.")] })
                }
            }

            if (args[1] === mg.author.id)
                return mg.reply({ embeds: [errorEmbed("- Cannot warn yourself.")] })

            if (member.roles.highest.position > mg.member.roles.highest.position)
                return mg.reply({ embeds: [errorEmbed("- Cannot warn high rank.")] })

            if (args[2] && args[2].length > 250)
                return mg.reply({ embeds: [errorEmbed("- Cannot send long reason!")] })

            const dmembed = new EmbedBuilder()
                .setFields(
                    {
                        name: "Reason",
                        value: `> ${args[2] ? args[2] : "Not provided"}`
                    }
                )
                .setAuthor({ name: `You have been warned in ${mg.guild.name}` })
                .setColor("Yellow")

                const row = new ActionRowBuilder().setComponents(
                    new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/channels/${mg.guild.id}/${mg.channel.id}`)
                    .setLabel(`Sent from ${mg.guild.name}`)
                )

            const embed = new EmbedBuilder()
                .setFields(
                    {
                        name: "Reason",
                        value: `> ${args[2] ? args[2] : "Not provided"}`
                    }
                )

            member.send({ embeds: [dmembed], components: [row] }).catch((err) => {
                console.log(err)
                embed.addFields({ name: "Error", value: "Couldn't reach member's DM!" })
            })

            embed.setAuthor({ name: `${member.user.username} warned` }).setColor("Green")
            mg.channel.send({ embeds: [embed] })
            //DB Here
        } catch (error) {
            Print("[WARNCMD] " + error, "Red");
            ErrorLog("WARNCMD", error);
        }
    }
}