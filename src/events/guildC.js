import { EmbedBuilder } from "discord.js";
import { DB } from "../handler/dbHandler.js";
import { Print } from "../handler/extraHandler.js";
import ServerDB from "../data/ServerDB.js";
import { ErrorLog } from "../systems/LogSystem.js";

export default {
    name: "guildCreate",
    async eventrun(client, guild) {
        try {
            let guildID = guild.id;
            const server = new ServerDB(guildID)

            let resultat = await server.getGuild(DB, guildID);

            if (!resultat.length) {
                if (guild.systemChannel) {
                    const JoinBed = new EmbedBuilder()
                        .setColor("Green")
                        .setDescription(`Hello thank you for adding **${client.user.username}**!\n- For more info about commands use : \`\`!help\`\`\n- Our website is coming soon.`)
                        .setTimestamp()
                        .setFooter({ text: `${client.user.username}` });

                    guild.systemChannel.send({ embeds: [JoinBed] });
                }
            }
        } catch (err) {
            Print("[ERROR] " + err, "Red");
            ErrorLog("BOT Guildcreate", err);
        }
    }
}