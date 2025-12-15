const { REST, Routes } = require("discord.js")
const { config } = require("dotenv")
const fs = require("fs")
config()
const path = require("path")

const cmds = []

function commandHandler(client) {
    const cmdFolder = path.join(__dirname, "../cmd")
    const cmdFiles = fs.readdirSync(cmdFolder).filter((file) => file.endsWith(".js"))

    for (file of cmdFiles) {
        const filepath = path.join(cmdFolder, file)
        const cmd = require(filepath)
        if ('data' in cmd && 'execute' in cmd) {
            client.commands.set(cmd.data.name, cmd)
            cmds.push(cmd.data.toJSON())
        } else {
            console.log("no cmd recognized")
        }
        console.log(`adding new cmd ${cmds.length}`)
    }

    client.application.commands.set(cmds)

    const rest = new REST().setToken(process.env.TOKEN);
    (async () => {
        try {
            console.log(`Started refreshing ${cmds.length} application (/) commands.`);
            const data = await rest.put(Routes.applicationCommands(client.user.id), { body: cmds });
            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            console.error(error);
        }
    })()
}
module.exports = { commandHandler }