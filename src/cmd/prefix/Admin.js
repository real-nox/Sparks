module.exports = {
    name : "admin",
    admin : true,
    prerun(mg) {
        mg.reply('hey admin')
    }
}