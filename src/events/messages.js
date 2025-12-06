const color = require("colors")
const path = require("path")
const fs = require("fs")

module.exports = {
    name: "messageCreate",
    async eventrun(client, mg) {
        try {
            if(mg.author.bot) return
            const prefix = "!"

            const PRE_cmdsDIR = path.join(__dirname, '../prefix')
            const PRE_cmdsFiles = fs.readdirSync(PRE_cmdsDIR).filter((file) => file.endsWith(".js"));

            for (file of PRE_cmdsFiles) {
                const PRE_Path = path.join(PRE_cmdsDIR, file)
                const Pre_cmd = require(PRE_Path)
                const name = file.split(".")[0]

                client.prefixs.set(name, Pre_cmd)

                if (mg.content.startsWith(prefix)) {
                    const args = mg.content.slice(prefix.length).trim().split(/ +/)
                    const command = args.shift().toLowerCase()

                    const precmd = client.prefixs.get(command)

                    if (!precmd) return
                    Pre_cmd.prerun(mg);
                }
            }
        } catch (err) {
            console.error(color.red("[ERROR] ", err))
        }
    }
}