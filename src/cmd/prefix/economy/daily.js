import { EmbedBuilder, time, TimestampStyles } from "discord.js"
import { Print } from "../../../handler/extraHandler.js"
import { CmdError, ErrorLog } from "../../../systems/LogSystem.js";
import Economy from "../../../data/EconomyDB.js";

const max_coins = process.env.max_coins
export default {
    name: "dailys",
    cooldown: 4000,
    async prerun(mg) {
        try {
            const userID = mg.author.id;
            const guildID = mg.guild.id;
            const bal = 100

            let economy = new Economy(userID, guildID)
            let userECO = await economy.getUserEco();

            const dailyEmbed = new EmbedBuilder().setTimestamp()

            if (userECO[0]?.balance >= max_coins) {
                dailyEmbed.setDescription("You have reached the maximum amount of sparks").setColor("DarkRed")
                return mg.reply({ embeds: [dailyEmbed] })
            }

            let dailyCooldown = userECO[0].dailyc
            let cooldown24h = parseInt(process.env.dailyc) + Date.now();

            if (dailyCooldown && dailyCooldown > Date.now()) {
                let remaining = dailyCooldown - Date.now();
                let remainingT = Math.floor(dailyCooldown / 1000);

                dailyEmbed.setDescription(`You have to wait for ${time(remainingT, TimestampStyles.RelativeTime)}`).setColor("Red")
                return mg.reply({ embeds: [dailyEmbed] })
                    .then(async (msg) => {
                        setTimeout(async () => {
                            try {
                                await msg.delete();
                            } catch (err) {
                                console.warn("Message could'nt be deleted:", err.message);
                            }
                        }, remaining);
                    }).catch(console.error);
            }

            userECO[0].balance += bal;
            let resultat = await economy.setSparks(userECO[0].balance, "dailyc", cooldown24h)

            if (!resultat)
                return msg.reply({ embeds: [CmdError()] });

            dailyEmbed.setDescription(`Added \`${balance}\` sparks to your balance!`)
            return mg.reply({ embeds: [dailyEmbed] });
        } catch (error) {
            Print("[DAILYcmd] " + error, "Red");
            ErrorLog("DAILYcmd", error);
        }
    }
}