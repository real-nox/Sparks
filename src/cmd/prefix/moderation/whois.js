import { EmbedBuilder, time, TimestampStyles } from "discord.js"
import { ErrorLog, incorrectformcmd } from "../../../systems/LogSystem.js"
import { Print } from "../../../handler/extraHandler.js"

export default {
    name: "whois",
    aliases: ["wh"],
    staff: true,
    async prerun(mg, client) {
        try {
            const args = mg.content.split(" ")
            let member = mg.member.user

            if (args.length > 1) {
                try {
                    const user = await client.users.fetch(args[1])
                    member = user
                } catch (error) {
                    return mg.reply({ embeds: [new EmbedBuilder().setDescription("Unknown User!").setColor("Red")] })
                }
            }

            const whoisEmbed = new EmbedBuilder()
                .setTitle(`Whois - ${member.username}`)
                .setThumbnail(member.displayAvatarURL({ dynamic: true }))
                .setColor("DarkOrange")
                .setFields(
                    {
                        name: "User Info",
                        value: `- **ID:** \`${member.id}\`\n- **User:** ${member.username}\n- **Mention:** ${member}\n- **Created:** ${time(Math.floor(Date.parse(member.createdAt) / 1000), TimestampStyles.RelativeTime)}\n- **Avatar:** [Avatar](${member.displayAvatarURL({ dynamic: true })})${member.banner ? `\n- **Banner:** [Banner](${member.bannerURL({ dynamic: true })})` : ""}`
                    }
                )

            if (member.primaryGuild && member.primaryGuild.identityGuildId) {
                whoisEmbed.addFields(
                    {
                        name: "Clan",
                        value: `- **Guild ID:** \`${member.primaryGuild.identityGuildId}\`\n- **Tag:** ${member.primaryGuild.tag}`
                    }
                )
            }
            if (member.banner) whoisEmbed.setImage(member.bannerURL({ dynamic: true, size: 1024 }))

            let m_guild = mg.guild.members.cache.get(member.id)

            if (m_guild) {
                const roles = mg.member.roles.cache
                whoisEmbed.addFields(
                    {
                        name: "Server",
                        value: `- **Joined:** ${time(Math.floor(m_guild.joinedTimestamp / 1000), TimestampStyles.RelativeTime)}\n- **Top Role:** ${mg.member.roles.highest}`
                    }
                )

                if (roles) {
                    whoisEmbed.addFields(
                        {
                            name: "Roles",
                            value: `${roles.map(role => role.name === "@everyone" ? "" : `> ${role}`).join(" ")}`
                        }
                    )
                }
            }

            await mg.channel.send({ embeds: [whoisEmbed] })
        } catch (error) {
            Print("[WHOISCMD] " + error, "Red");
            ErrorLog("WHOISCMD", error);
        }
    }
}