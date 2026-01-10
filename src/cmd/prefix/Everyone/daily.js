const { time, TimestampStyles } = require("discord.js");
const { getBalC, Dailys } = require("../../../data/EconomyDB");
const { DB } = require("../../../handler/dbHandler");
const { Print } = require("../../../handler/extraHandler");
const { ErrorLog } = require("../../../handler/logsHanlder");

module.exports = {
    name: "dailys",
    async prerun(mg) {
        try {
            let userID = mg.author.id;
            let guildID = mg.guild.id;

            let userECO = await getBalC(DB, userID, guildID);
            let cooldown24h = 86400 * 1000 + Date.now();

            let bal = 100

            if (!userECO) {
                await Dailys(DB, userID, guildID, bal, cooldown24h, false);
            }

            if (userECO.balance === 100000) {
                return mg.reply("You are too rich...");
            }

            if (userECO.dailyc && userECO.dailyc > Date.now()) {
                let remaining = userECO.dailyc - Date.now();
                let remainingT = Math.floor(userECO.dailyc / 1000);

                return mg.reply(`wait for ${time(remainingT, TimestampStyles.RelativeTime)}`)
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

            userECO.balance += bal;
            let [res] = await Dailys(DB, userID, guildID, userECO.balance, cooldown24h, true)

            if (res) {
                return mg.reply(`Daily : ${bal} has been added to your balance`);
            }
        } catch (error) {
            Print("[DAILYcmd] " + error, "Red");
            ErrorLog("DAILYcmd", error);
        }
    }
}