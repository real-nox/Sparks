const { WebhookClient, EmbedBuilder } = require("discord.js");
const { Print } = require("./extraHandler");
const { config } = require("dotenv");
config({ quiet: true });

function ErrorLog(title, message) {
    try {
        const webURI = process.env.WEBURL;
        const webhook = new WebhookClient({ url: webURI });

        const Embed = new EmbedBuilder().setTitle(`${title}`).setDescription(`> ${message}`).setColor("Red");

        webhook.send({ content: `<@&1227234977985466449>`, embeds: [Embed] });
    } catch (err) {
        Print("[ERROR] : " + err, "Red");
    }
}

function EventLog(message) {
    try {
        const webURI = process.env.WEBURLEVENT;
        const webhook = new WebhookClient({ url: webURI });

        const Embed = new EmbedBuilder().setTitle(`Event Started`).setDescription(`${message}`).setColor("DarkGreen").setTimestamp();

        webhook.send({ embeds: [Embed] });
    } catch (err) {
        Print("[ERROR] : " + err, "Red");
    }
}

function SuggestionLog(user, message) {
    try {
        const webURI = process.env.WEBURLSUGGESTIONS;
        const webhook = new WebhookClient({ url: webURI });

        const Embed = new EmbedBuilder().setTitle(`Suggestion from : ${user}`).setDescription(`${message}`).setColor("Green").setTimestamp();

        const res = webhook.send({ content: `<@&1227234977985466449>`, embeds: [Embed] });

        if (res) return true;
        return false;
    } catch (err) {
        Print("[ERROR] : " + err, "Red");
    }
}

module.exports = { ErrorLog, EventLog, SuggestionLog }