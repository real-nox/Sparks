import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, Message, PermissionFlagsBits, time, TimestampStyles } from "discord.js";
import { Print } from "../../../handler/extraHandler.js"
import { ErrorLog, incorrectformcmd } from "../../../systems/LogSystem.js";

export default {
    name: "mute",
    staff: true,
    async prerun(mg = Message) {
        try {
            const args = mg.content.toLowerCase().split(" ")
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
                return mg.reply({ embeds: [errorEmbed("- Cannot mute yourself.")] })

            if (member.roles.highest.position > mg.member.roles.highest.position)
                return mg.reply({ embeds: [errorEmbed("- Cannot mute high rank.")] })

            if (args[2] && args[2].length > 250)
                return mg.reply({ embeds: [errorEmbed("- Cannot send long reason!")] })

            let timeFormat = {
                m: 60, mins: 60,
                h: 3600, hours: 3600,
                d: 86400, days: 86400
            };

            let timeT = null
            if (args[3]) {
                const unit = Object.keys(timeFormat)
                    .sort((a, b) => b.length - a.length)
                    .find(char => args[3].endsWith(char))

                const value = Number(args[3].slice(0, -unit.length));
                if (!unit || !Number.isInteger(value) || value <= 0)
                    return mg.reply({ embeds: [errorEmbed("- Provide a correct duration.\n**Ex:** `10m` or `10mins`\n- You can use (`m` `mins`) or (`h` `hours`) or (`d` `days`)")] })
                timeT = Math.floor(Date.now() / 1000) + value * timeFormat[unit]
            }

            const mutedRole = mg.guild.roles.cache.find(r => r.name === "Muted")

            if (!mutedRole) {
                try {
                    const role = await mg.guild.roles.create({
                        colors: {
                            primaryColor: "DarkButNotBlack"
                        },
                        position: mg.guild.members.me.roles.highest.position - 1,
                        name: "Muted",
                        reason: "Created muted role for moderation commands"
                    })

                    if (!role)
                        console.log("Something wrong happened while creating the role!")

                    role.setPermissions([])
                    await member.roles.add(role)
                } catch (err) {
                    console.error(err);
                }
            }

            await member.timeout(value * timeFormat[unit], `Muted ${member.id} by ${mg.member.id}: ${args[2]}`)
            const dmembed = new EmbedBuilder()
                .setFields(
                    {
                        name: "Reason",
                        value: `> ${args[2] ? args[2] : "Not provided"}`
                    },
                    {
                        name: "Duration",
                        value: `${time(timeT, TimestampStyles.ShortTime)}`
                    }
                )
                .setAuthor({ name: `You have been muted in ${mg.guild.name}` })
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
                    },
                    {
                        name: "Duration",
                        value: `${time(timeT, TimestampStyles.ShortTime)}`
                    }
                )

            /*member.send({ embeds: [dmembed], components: [row] }).catch((err) => {
                console.log(err)
                embed.addFields({ name: "Error", value: "Couldn't reach member's DM!" })
            })*/

            embed.setAuthor({ name: `${member.user.username} muted` }).setColor("Green")
            mg.channel.send({ embeds: [embed] })
            //DB Here
        } catch (error) {
            Print("[WARNCMD] " + error, "Red");
            ErrorLog("WARNCMD", error);
        }
    }
}