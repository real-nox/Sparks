const { Print } = require("../handler/extraHandler");
const { ErrorLog } = require("../handler/logsHanlder");

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

            if (precmd.cooldown) {
                let cooldownUntil = client.cooldowns.get(`${precmd.name}-${mg.author.id}`);
                if (cooldownUntil && cooldownUntil > Date.now()) {
                    return mg.reply(`Command is on cooldown for ${Math.ceil((cooldownUntil - Date.now()) / 1000)} secs`);
                }

                client.cooldowns.set(`${precmd.name}-${mg.author.id}`, new Date().valueOf() + precmd.cooldown);
            }
            /*if (!precmd.admin)
                if (!mg.member.permissions.has("Administrator"))
                    return ErrorLog("Permssion", "You're not an admin")*/

            if (!precmd) return;
            precmd.prerun(mg, client);
        } catch (err) {
            Print("[ERROR] " + err, "Red");
            ErrorLog("Message", err);
        }
    }
}