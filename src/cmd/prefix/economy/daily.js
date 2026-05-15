import { EmbedBuilder, time, TimestampStyles } from "discord.js"
import { Print } from "../../../handler/extraHandler.js"
import { CmdError, ErrorLog } from "../../../systems/LogSystem.js";
import Economy from "../../../data/EconomyDB.js";

export default {
    name: "dailys",
    cooldown: 4000,
    async prerun(mg) {
        try {
            let userID = mg.author?.id;
            let guildID = mg.guild?.id;

            let economy = new Economy(userID, guildID);
            let eco_user = await economy.getUserEco();

            let daily_config = {
                sparks: 100,
                balance: 100,
                max_coins: process.env.max_coins,
                cooldown24h: parseInt(process.env.earnc) + Date.now(),
            }

            const dailyEmbed = new EmbedBuilder().setTimestamp();

            if (eco_user && eco_user.length) {
                if (eco_user[0]?.balance >= daily_config.max_coins) {
                    dailyEmbed.setDescription("You have reached the maximum amount of sparks").setColor("DarkRed");
                    return mg.reply({ embeds: [dailyEmbed] });
                }

                let dailyCooldown = userECO[0]?.dailyc

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

                daily_config.balance += eco_user[0].balance
            }

            let resultat = await economy.setSparks(daily_config.balance, "dailyc", daily_config.cooldown24h)

            if (!resultat)
                return msg.reply({ embeds: [CmdError()] });

            dailyEmbed.setDescription(`Added \`${daily_config.sparks}\` sparks to your balance!`);
            return mg.reply({ embeds: [dailyEmbed] });
        } catch (error) {
            Print("[DAILYcmd] " + error, "Red");
            ErrorLog("DAILYcmd", error);
        }
    }
}