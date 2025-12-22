const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { commandHandler } = require("./handler/commandHandler");
const { config } = require("dotenv"); config({ quiet: true });
const { eventHandler } = require("./handler/eventHandler");
const { Print, ErrorLog } = require("./handler/extraHandler");
const { LoaddDB } = require("./handler/dbHandler");

let bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

bot.prefixs = new Collection();
bot.commands = new Collection();

bot.login(process.env.TOKEN).then(() => {
    try {
        eventHandler(bot);
        commandHandler(bot);
        LoaddDB();
    } catch (err) {
        Print("[ERROR] " + err, "Red");
        ErrorLog("BOT Launch", err)
    }
});