const { config } = require("dotenv"); config({ quiet: true })
const { green, yellow, red, blue } = require("colors");
const { WebhookClient, EmbedBuilder } = require("discord.js");

function Print(message, type = "Green") {
    try {
        if (type == "Green")
            console.log(green(message))
        if (type == "Yellow")
            console.log(yellow(message))
        if (type == "Red")
            console.log(red(message))
        if (type == "Blue")
            console.log(blue(message))
    } catch (err) {
        console.log(red(message))
    }
}

function ErrorLog(title, message) {
    try {
        const webURI = process.env.WEBURL;
        const ERRwebhook = new WebhookClient({ url: webURI });

        const ERRBED = new EmbedBuilder().setTitle(`${title}`).setDescription(`> ${message}`).setColor("Red");

        ERRwebhook.send({ embeds: [ERRBED] });
    } catch (err) {
        Print("[ERROR] : " + err, "Red");
    }
}

module.exports = { Print, ErrorLog }