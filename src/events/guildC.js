const { EmbedBuilder } = require("discord.js");
const { setGuild, getGuild } = require("../data/ServerDB");
const { DB } = require("../handler/dbHandler");
const { Print } = require("../handler/extraHandler");
const { ErrorLog } = require("../handler/logsHanlder");

module.exports = {
    name: "guildCreate",
    async eventrun(client, guild) {
        try {
            let guildID = guild.id;

            let resultat = await getGuild(DB, guildID);

            if (resultat.length == 0) {
                if (guild.systemChannel) {
                    const JoinBed = new EmbedBuilder()
                    .setColor("Green")
                    .setDescription(`Hello thank you for adding **${client.user.username}**!\n- For more info about commands use : \`\`!lscmd\`\`\n- Our website is coming soon.`)
                    .setTimestamp()
                    .setFooter({text : `${client.user.username}`});

                    guild.systemChannel.send({embeds : [JoinBed]});
                }

                await setGuild(DB, guild.id);
            }
        } catch (err) {
            Print("[ERROR] " + err, "Red");
            ErrorLog("BOT Guildcreate", err);
        }
    }
}