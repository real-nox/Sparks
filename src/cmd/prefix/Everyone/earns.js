const { time, TimestampStyles } = require("discord.js");
const { getBalC, Earns } = require("../../../data/EconomyDB");
const { DB } = require("../../../handler/dbHandler");
const { Print } = require("../../../handler/extraHandler");
const { ErrorLog } = require("../../../handler/logsHanlder");

module.exports = {
    name: "earns",
    async prerun(mg) {
        try {
            let userID = mg.author.id;
            let guildID = mg.guild.id;

            let addedS
            let userECO = await getBalC(DB, userID, guildID);
            let cooldown = 30000;
            let balance = 50;

            const cooldownEnd = Date.now() + cooldown;

            if (!userECO) {
                addedS = await Earns(DB, userID, guildID, balance, cooldownEnd, false);
                if (addedS)
                    return mg.reply(`Added ${balance} sparks to your balance!`);
            }

            if (userECO.balance == 100000) {
                return mg.reply("You have reached the maximum amount of sparks");
            }

            if (userECO.earnc && userECO.earnc > Date.now()) {
                const remaining = userECO.earnc - Date.now();
                const remainingT = Math.floor(userECO.earnc / 1000);

                return await mg.reply(`You have to wait for ${time(remainingT, TimestampStyles.RelativeTime)}`)
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

            userECO.balance += balance;
            addedS = await Earns(DB, userID, guildID, userECO.balance, cooldownEnd, true);

            if (addedS) {
                return mg.reply(`Added ${balance} sparks to your balance!`);
            }
        } catch (error) {
            Print("[Earnscmd] " + error, "Red");
            ErrorLog("Earnscmd", error);
        }
    }
}