const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { config } = require("dotenv"); config({ quiet: true });
const { commandHandler } = require("./handler/commandHandler");
const { eventHandler } = require("./handler/eventHandler");
const color = require("colors");

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
        eventHandler(bot)
        commandHandler(bot)
        //DBHandler()
    } catch (err) {
        eventHandler(bot)
        //DBHandler()
        console.error(color.red("[ERROR] "), err)
    }
});