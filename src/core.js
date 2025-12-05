const {Client, GatewayIntentBits} = require("discord.js");
const {config} = require("dotenv"); config({quiet : true});
const { eventHandler } = require("./handler/eventHandler");
const { DBHandler, DB } = require("./handler/dbHandler");
const color = require("colors");
const { Db } = require("mongodb");

let bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

bot.login(process.env.TOKEN).then(() => {
    try {
        eventHandler(bot)
        DBHandler()
    } catch (err) {
        console.error(color.red("[ERROR] "), err)
    }
});