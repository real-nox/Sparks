const RGLGame = require("../../classes/RGLGame")
const { getGameBYID, gameStart } = require("../../data/RGLDB")
const { DB } = require("../../handler/dbHandler")

module.exports = {
    name : "rgl",
    async prerun(mg, client) {
        const guildID = mg.guild.id;
        const channelID = mg.channel.id;

        mg.reply("starting")
        gameStart(DB, guildID, channelID)
        //const game = await getGameBYID(DB, 1)

        /*if(!game) {
            return mg.reply("no game with this ID")
        }*/
    }
}