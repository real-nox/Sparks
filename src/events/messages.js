import { ErrorLog } from "../systems/LogSystem.js"
import { Print } from "../handler/extraHandler.js"
import { EmbedBuilder, time, TimestampStyles } from "discord.js";
import ServerDB from "../data/ServerDB.js";

export default {
    name: "messageCreate",
    async eventrun(client, mg) {
        try {
            if (mg.author.bot || !mg.guild) return;

            let Server = new ServerDB(mg.guild.id);

            const guild = await Server.getGuild();
            const prefix = guild ? guild[0]?.prefix : '!';

            if (!mg.content.startsWith(prefix) && !mg.content.startsWith("!")) return;

            let len = prefix.length

            if(mg.content.startsWith("!"))
                len=1
            
            const args = mg.content.slice(len).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            const precmd = client.prefixs.get(command) || client.prefixs.find(cmd => cmd.aliases && cmd.aliases.includes(command));

            if (!precmd) return;

            //Cooldown
            if (precmd.cooldown) {
                let cooldownUntil = client.cooldowns.get(`${precmd.name}-${mg.author.id}`);
                if (cooldownUntil && cooldownUntil > Date.now()) {
                    cooldownUntil = Math.floor(cooldownUntil / 1000)

                    const coolembed = new EmbedBuilder()
                        .setDescription(`Command is on cooldown for ${time(cooldownUntil, TimestampStyles.RelativeTime)}`).setColor("Red");
                    return mg.reply({ embeds: [coolembed] });
                }

                client.cooldowns.set(`${precmd.name}-${mg.author.id}`, new Date().valueOf() + precmd.cooldown);
            }

            //Owner
            if (precmd.owner)
                if (mg.author.id != "432592303450882064") return;

            //Admin
            if (precmd.admin)
                if (!mg.member.permissions.has("Administrator")) {
                    const permbed = new EmbedBuilder()
                        .setDescription("```You are not an admin to use this command!```").setColor("Red");
                    return mg.reply({ embeds: [permbed] });
                }

            //Staff
            if (precmd.staff)
                if (!mg.member.permissions.has("Administrator") && !mg.member.permissions.has("ManageMessages") && !mg.member.roles.cache.has((await getStaffR(ServerC, mg.guild.id)).staffRID || '0')) {
                    const permbed = new EmbedBuilder()
                        .setDescription("```You are not a staff to use this command!```").setColor("Red");
                    return mg.reply({ embeds: [permbed] });
                }


            precmd.prerun(mg, client);
        } catch (err) {
            Print("[ERROR] " + err, "Red");
            ErrorLog("Message", err);
        }
    }
}