const { ErrorLog, Print } = require("../handler/extraHandler");

module.exports = {
    name: "messageCreate",
    async eventrun(client, mg) {
        try {
            if (mg.author.bot) return;
            if (!mg.guild) return;

            const prefix = "!";
            const args = mg.content.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            const precmd = client.prefixs.get(command) || client.prefixs.find(cmd => cmd.aliases && cmd.aliases.includes(command));

            if (!precmd) return;
            precmd.prerun(mg, client);
        } catch (err) {
            Print("[ERROR] " + err, "Red");
            ErrorLog("Message", err);
        }
    }
}