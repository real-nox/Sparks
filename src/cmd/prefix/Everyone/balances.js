import { EmbedBuilder } from "discord.js";
import Economy from "../../../data/EconomyDB.js";
import { Print } from "../../../handler/extraHandler.js";
import { ErrorLog } from "../../../systems/LogSystem.js";

export default {
    name: "bal",
    cooldown: 2000,
    async prerun(mg) {
        try {
            let userID = mg.author.id;
            const guildID = mg.guild.id;

            const args = mg.content.split(" ")

            let economy

            if (args.length > 1) {
                let member;
                try {
                    member = await mg.guild.members.fetch(args[1]);
                } catch (error) {
                    if (error.code === 10007 || error.code === 10013) {
                        const balembed = new EmbedBuilder()
                            .setDescription(`I cannot find this user in this server.`).setColor("Red");
                        return mg.reply({ embeds: [balembed] });
                    } else {
                        const balembed = new EmbedBuilder()
                            .setDescription(`An unexpected error occurred.`).setColor("Red");
                        console.error(error);
                        return mg.reply({ embeds: [balembed] });
                    }
                }

                economy = new Economy(args[1], guildID)
                let bal = await economy.getBalance();

                const balembed = new EmbedBuilder().setTitle(`${member.user.username}`).setDescription(`<@${args[1]}>'s balance is : \`${bal ? bal : 0}\` Sparks`)
                return mg.reply({ embeds: [balembed] });
            }

            economy = new Economy(userID, guildID)
            let bal = await economy.getBalance();

            const balembed = new EmbedBuilder().setTitle(`${mg.author.username}`).setDescription(`Your balance is : \`${bal}\` Sparks`).setColor("DarkGold")
            return mg.reply({ embeds: [balembed] });
        } catch (error) {
            Print("[Balcmd] " + error, "Red");
            ErrorLog("Balcmd", error);
        }
    }
}