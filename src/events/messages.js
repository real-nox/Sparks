const color = require("colors")
const path = require("path")
const fs = require("fs");
const { ErrorLog } = require("../handler/extraHandler");

module.exports = {
    name: "messageCreate",
    async eventrun(client, mg) {
        try {
            if (mg.author.bot) return;
            const prefix = "!";
            const args = mg.content.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            const precmd = client.prefixs.get(command) || client.prefixs.find(cmd => cmd.aliases && cmd.aliases.includes(command));

            if (!precmd) return;
            precmd.prerun(mg);
        } catch (err) {
            Print("[ERROR] " + err, "Red");
            ErrorLog("Message", err);
        }
    }
}