const { prerun } = require("./listcmds");

module.exports = {
    name : "test",
    cooldown : 10000,
    prerun(mg) {
        mg.reply("cool")
    }
}