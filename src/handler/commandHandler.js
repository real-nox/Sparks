const { config } = require("dotenv"); config({ quiet: true });
const { REST, Routes } = require("discord.js");
const { Print, ErrorLog } = require("./extraHandler");
const path = require("path");
const fs = require("fs");

const cmds = [];
const prefixs = [];

const asciiTable = require("ascii-table");
const cmdTable = new asciiTable("Commands");
cmdTable.setHeading("Name", "Type", "Execute");

function commandHandler(client) {
    try {
        const CMDFolder = path.join(__dirname, "../cmd/slash");
        const PREFolder = path.join(__dirname, "../cmd/prefix");
        const cmdFiles = fs.readdirSync(CMDFolder).filter((file) => file.endsWith(".js"));
        const preFiles = fs.readdirSync(PREFolder).filter((file) => file.endsWith(".js"));

        for (const file of cmdFiles) {
            const filepath = path.join(CMDFolder, file);
            const cmd = require(filepath);

            if ('data' in cmd && 'execute' in cmd) {
                client.commands.set(cmd.data.name, cmd);
                cmds.push(cmd.data.toJSON());
                cmdTable.addRow(file, "Slash", "Loaded");
            } else {
                cmdTable.addRow(file, "Slash", "Unloaded");
            }
        }

        client.application.commands.set(cmds);

        for (const file of preFiles) {
            const filepath = path.join(PREFolder, file);
            const pre = require(filepath);

            if (pre.prerun || pre.name) {
                client.prefixs.set(pre.name, pre);
                prefixs.push(pre.name);
                cmdTable.addRow(file, "Prefix", "Loaded");
            } else {
                cmdTable.addRow(file, "Prefix", "Unloaded");
            }
        }

        Print(cmdTable.toString(), "Blue");

        const rest = new REST().setToken(process.env.TOKEN);
        (async () => {
            try {
                Print(`> Started refreshing ${cmds.length} application (/) commands.`, "Yellow");
                const data = await rest.put(Routes.applicationCommands(client.user.id), { body: cmds });
                Print(`> Successfully reloaded ${data.length} application (/) commands.`, "Green");
            } catch (error) {
                Print("[ERROR] " + error, "Red");
                ErrorLog("COMMANDS", error);
            }
        })()
    } catch (error) {
        Print("[ERROR] " + error, "Red");
        ErrorLog("COMMANDS", error);
    }
}
module.exports = { commandHandler }