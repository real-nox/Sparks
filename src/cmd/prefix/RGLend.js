const { gameEnd } = require("../../data/RGLDB")
const { DB } = require("../../handler/dbHandler")

module.exports = {
    name: "rgl-end",
    async prerun(mg) {
        const guildID = mg.guild.id;
        const channelID = mg.channel.id;

        let deleted = await gameEnd(DB, guildID, channelID)
        console.log(deleted)
        if(deleted) {
            mg.reply("Game has been deleted!")
        }
    }
}