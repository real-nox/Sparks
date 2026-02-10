import { config } from "dotenv"; config({ quiet: true });

import { commandHandler } from "./handler/commandHandler.js";
import { eventHandler } from "./handler/eventHandler.js";
import { LoadDB } from "./handler/dbHandler.js";

import { ErrorLog } from "./systems/LogSystem.js";
import { Print } from "./handler/extraHandler.js";

import { Client, Collection, GatewayIntentBits } from "discord.js";

//Settings
const token = process.env.TOKEN;

const bot = new Client({
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

bot.login(token).then(async () => {
    try {
        await eventHandler(bot);
        await commandHandler(bot);
        await LoadDB();
    } catch (err) {
        Print("[ERROR BOT] " + err, "Red");
        ErrorLog("BOT Launch", err)
    }
});