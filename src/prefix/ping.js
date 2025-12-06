module.exports = {
    name : "ping",
    prerun(mg) {
        let date = Date.now()
        mg.reply("test", date)
    }
}