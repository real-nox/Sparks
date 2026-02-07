import { EmbedBuilder } from "discord.js"
import { Print } from "../../../handler/extraHandler.js"
import { ErrorLog } from "../../../systems/LogSystem.js";
import ServerDB from "../../../data/ServerDB.js";

export default {
    name: "prefix",
    admin: true,
    cooldown: 10000,
    async prerun(msg) {
        try {
            const guildId = msg.guild.id
            let prefix = msg.content.split(" ");
            prefix = prefix[1];

            if (prefix.length > 3 || prefix.match(/^\\d$/))
                return msg.reply("Long prefix! Use shorter prefix.");

            let Server = new ServerDB(guildId);

            let oldPrefix = await Server.getPrefix()

            const embedR = new EmbedBuilder()

            if (oldPrefix === prefix) {
                embedR.setDescription("Choose another prefix!").setColor("Red")
                return msg.reply({ embeds: [embedR] });
            }

            const isUpdated = await Server.setPrefix(prefix)

            if (!isUpdated) {
                embedR.setDescription("An error had happened, please use this command later. Or contact support.").setColor("Red")
                return msg.reply({ embeds: [embedR] });
            }

            embedR.setDescription(`Prefix update for **${msg.guild.name}** !\n\n- **Previous Prefix :** ${oldPrefix ? oldPrefix : '!'}\n- **New Prefix :** ${prefix}`).setTimestamp();

            return msg.channel.send({ embeds: [embedR] });

        } catch (error) {
            Print("[PREFIXCHANGE] " + error, "Red");
            ErrorLog("PREFIXCHANGE", error);
        }
    }
}