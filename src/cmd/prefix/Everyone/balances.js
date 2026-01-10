const { getBalC } = require("../../../data/EconomyDB");
const { DB } = require("../../../handler/dbHandler");

module.exports = {
    name: "bal",
    async prerun(mg) {
        try {
            let userID = mg.author.id;
            let guildID = mg.guild.id;

            let { balance } = await getBalC(DB, userID, guildID);

            return mg.reply(`You have ${balance}`);
        } catch (error) {
            Print("[Balcmd] " + error, "Red");
            ErrorLog("Balcmd", error);
        }
    }
}