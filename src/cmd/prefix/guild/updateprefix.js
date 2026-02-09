import { EmbedBuilder } from "discord.js"
import { Print } from "../../../handler/extraHandler.js"
import { CmdError, ErrorLog } from "../../../systems/LogSystem.js";
import ServerDB from "../../../data/ServerDB.js";

export default {
    name: "prefix",
    admin: true,
    cooldown: 50000,
    async prerun(msg) {
        try {
            const guildId = msg.guild.id
            let prefix = msg.content.split(" ")[1];

            if (prefix.length > 3 || prefix.match(/^\\d$/))
                return msg.reply("Long prefix! Use shorter prefix.");

            let Server = new ServerDB(guildId);

            let oldPrefix = await Server.getPrefix()

            const embedR = new EmbedBuilder().setTimestamp().setFooter({ text: `${msg.guild.name}` })

            if (oldPrefix === prefix) {
                embedR.setDescription("- Cannot update prefix, it's already been updated with the same prefix.").setColor("Red")
                return msg.reply({ embeds: [embedR] });
            }

            const isUpdated = await Server.setPrefix(prefix)

            if (!isUpdated)
                return msg.reply({ embeds: [CmdError()] });

            embedR
                .setDescription(`Prefix update for **${msg.guild.name}** !\n\n- **Previous Prefix :** ${oldPrefix ? oldPrefix : '!'}\n- **New Prefix :** ${prefix}`)
                .setColor("Green")

            return msg.channel.send({ embeds: [embedR] });

        } catch (error) {
            Print("[PREFIXCHANGE] " + error, "Red");
            ErrorLog("PREFIXCHANGE", error);
        }
    }
}