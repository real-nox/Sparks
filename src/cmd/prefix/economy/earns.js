import { EmbedBuilder, time, TimestampStyles } from "discord.js";
import { Print } from "../../../handler/extraHandler.js";
import { CmdError, ErrorLog } from "../../../systems/LogSystem.js";
import Economy from "../../../data/EconomyDB.js";

const max_coins = process.env.max_coins
export default {
    name: "earns",
    cooldown: 4000,
    async prerun(mg) {
        try {
            const balance = 50
            const userID = mg.author.id;
            const guildID = mg.guild.id;

            let economy = new Economy(userID, guildID)
            let userECO = await economy.getUserEco()

            const earnEmbed = new EmbedBuilder().setTimestamp()

            if (userECO[0]?.balance >= max_coins) {
                earnEmbed.setDescription("You have reached the maximum amount of sparks").setColor("DarkRed")
                return mg.reply({ embeds: [earnEmbed] })
            }

            let earnCooldown = userECO[0].earnc;
            const cooldown = parseInt(process.env.earnc) + Date.now();

            if (earnCooldown && earnCooldown > Date.now()) {
                const remaining = earnCooldown - Date.now();
                const remainingT = Math.floor(earnCooldown / 1000);

                earnEmbed.setDescription(`You have to wait for ${time(remainingT, TimestampStyles.RelativeTime)}`).setColor("Red")
                return await mg.reply({ embeds : [earnEmbed] })
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

            userECO[0].balance += balance;
            let resultat = await economy.setSparks(userECO[0].balance, "earnc", cooldown);

            if (!resultat)
                return msg.reply({ embeds: [CmdError()] });

            earnEmbed.setDescription(`Added \`${balance}\` sparks to your balance!`)
            return mg.reply({ embeds: [earnEmbed] });
        } catch (error) {
            Print("[Earnscmd] " + error, "Red");
            ErrorLog("Earnscmd", error);
        }
    }
}