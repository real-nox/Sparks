import { EmbedBuilder, TimestampStyles, time } from "discord.js";
import { Print } from "../../../handler/extraHandler.js"
import { ErrorLog } from "../../../systems/LogSystem.js";
import Economy from "../../../data/EconomyDB.js";

export default {
    name: "coinflip",
    cooldown: 2000,
    async prerun(mg) {
        try {
            const userID = mg.author.id;
            const guildID = mg.guild.id;

            let price = parseInt((mg.content.split(" "))[1]);

            const cfEmbed = new EmbedBuilder().setTimestamp()

            let economy = new Economy(userID, guildID)
            let userECO = await economy.getUserEco();

            if (!price) {
                cfEmbed.setDescription("Set your price between `50` and `2000` sparks.").setColor("DarkRed")
                return mg.reply({ embeds: [cfEmbed] });
            }

            if (price > 2000 || price < 50) {
                cfEmbed.setDescription("You must put your price between `50` and `2000` sparks.").setColor("DarkRed")
                return mg.reply({ embeds: [cfEmbed] });
            }

            if (!userECO[0]?.balance || (userECO[0] && userECO[0]?.balance < price)) {
                cfEmbed.setDescription("You don't have enough sparks for this bid.").setColor("DarkRed")
                return mg.reply({ embeds: [cfEmbed] });
            }

            if (userECO[0]?.balance >= max_coins) {
                cfEmbed.setDescription("You have reached the maximum amount of sparks").setColor("DarkRed")
                return mg.reply({ embeds: [cfEmbed] })
            }

            let cfCooldown = userECO[0].flipc
            let cooldown = parseInt(process.env.flipc) + Date.now();

            if (cfCooldown && cfCooldown > Date.now()) {
                let remaining = cfCooldown - Date.now();
                let remainingT = Math.floor(cfCooldown / 1000);

                cfEmbed.setDescription(`You have to wait for ${time(remainingT, TimestampStyles.RelativeTime)}`).setColor("Red")
                return mg.reply({ embeds: [cfEmbed] })
                    .then(async (msg) => {
                        setTimeout(async () => {
                            try {
                                await msg.delete();
                            } catch (err) {
                                console.warn("Message could'nt be deleted:", err.message);
                            }
                        }, remaining);
                    });
            }

            let luck = Math.floor(Math.random() * 100)
            let bal;
            let des;

            if (luck > 50) {
                bal = userECO.balance + price;
                des = `Lucky \`${price}\` has been added to your balance`;
                cfEmbed.setColor("DarkGreen");
            } else {
                bal = userECO.balance - price;
                des = `unlucky ${price} has been removed from your balance`;
                cfEmbed.setColor("DarkRed");

            }
            let resultat = await economy.setSparks(bal, "flipc", cooldown)

            if (!resultat)
                return msg.reply({ embeds: [CmdError()] });

            cfEmbed.setDescription(`${des}`)
            return mg.reply({ embeds: [cfEmbed] })
        } catch (error) {
            Print("[CFcmd] " + error, "Red");
            ErrorLog("CFcmd", error);
        }
    }
}