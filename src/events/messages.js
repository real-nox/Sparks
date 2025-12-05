const { DB } = require("../handler/dbHandler")
const coins = DB.db("Economy").collection("Coins")

module.exports = {
    name: "messageCreate",
    async run(mg) {
        if (mg.content == "!coin") {
            /*
            const result = await coins.insertOne({ID: mg.author.id, Bal:50});
            mg.reply(
                `Inserted in db`,
            );*/
        }
    }
}