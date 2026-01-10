const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { commandHandler } = require("./handler/commandHandler");
const { config } = require("dotenv"); config({ quiet: true });
const { eventHandler } = require("./handler/eventHandler");
const { ErrorLog } = require("./handler/logsHanlder");
const { Print } = require("./handler/extraHandler");
const { LoaddDB } = require("./handler/dbHandler");

let bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

//Bot collections
bot.prefixs = new Collection();
bot.commands = new Collection();
bot.events = new Collection();
bot.cooldowns = new Collection();

bot.login(process.env.TOKEN).then(async () => {
    try {
        eventHandler(bot);
        commandHandler(bot);
        await LoaddDB();
    } catch (err) {
        Print("[ERROR] " + err, "Red");
        ErrorLog("BOT Launch", err)
    }
});