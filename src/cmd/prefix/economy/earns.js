import { EmbedBuilder, Message, time, TimestampStyles } from "discord.js";
import { Print } from "../../../handler/extraHandler.js";
import { CmdError, ErrorLog } from "../../../systems/LogSystem.js";
import Economy from "../../../data/EconomyDB.js";

export default {
    name: "earns",
    cooldown: 4000,
    async prerun(mg) {
        try {
            let userID = mg.author?.id;
            let guildID = mg.guild?.id

            let economy = new Economy(userID, guildID)
            let eco_user = await economy.getUserEco()

            let earn_config = {
                sparks: 50,
                balance: 50,
                max_coins: process.env.max_coins,
                cooldown: parseInt(process.env.earnc) + Date.now(),
            }

            const earnEmbed = new EmbedBuilder().setTimestamp()

            if (eco_user && eco_user.length) {
                if (eco_user[0]?.balance >= earn_config.max_coins) {
                    earnEmbed.setDescription("You have reached the maximum amount of sparks").setColor("DarkRed")
                    return mg.reply({ embeds: [earnEmbed] })
                }

                let earnCooldown = eco_user[0]?.earnc;

                if (earnCooldown && earnCooldown > Date.now()) {
                    const remaining = earnCooldown - Date.now();
                    const remainingT = Math.floor(earnCooldown / 1000);

                    earnEmbed.setDescription(`You have to wait for ${time(remainingT, TimestampStyles.RelativeTime)}`).setColor("Red")
                    return await mg.reply({ embeds: [earnEmbed] })
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

                earn_config.balance += eco_user[0].balance
            }

            let resultat = await economy.setSparks(earn_config.balance, "earnc", earn_config.cooldown);

            if (!resultat)
                return mg.reply({ embeds: [CmdError()] });

            earnEmbed.setDescription(`Added \`${earn_config.sparks}\` sparks to your balance!`);
            return mg.reply({ embeds: [earnEmbed] });
        } catch (error) {
            Print("[Earnscmd] " + error, "Red");
            ErrorLog("Earnscmd", error);
        }
    }
}