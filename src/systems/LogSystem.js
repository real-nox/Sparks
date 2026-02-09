import { EmbedBuilder, WebhookClient } from "discord.js";
import { Print } from "../handler/extraHandler.js";

export function ErrorLog(title, message) {
    try {
        const webURI = process.env.WEBURL;
        const webhook = new WebhookClient({ url: webURI });

        const Embed = new EmbedBuilder().setTitle(`${title}`).setDescription(`> ${message}`).setColor("Red");

        webhook.send({ content: `<@&1470412330214097050>`, embeds: [Embed] });
    } catch (err) {
        Print("[ERROR] : " + err, "Red");
    }
}

export function EventLog(message) {
    try {
        const webURI = process.env.WEBURLEVENT;
        const webhook = new WebhookClient({ url: webURI });

        const Embed = new EmbedBuilder().setTitle(`Event Started`).setDescription(`${message}`).setColor("DarkGreen").setTimestamp();

        webhook.send({ embeds: [Embed] });
    } catch (err) {
        Print("[ERROR] : " + err, "Red");
    }
}

export function SuggestionLog(user, message) {
    try {
        const webURI = process.env.WEBURLSUGGESTIONS;
        const webhook = new WebhookClient({ url: webURI });

        const Embed = new EmbedBuilder().setTitle(`Suggestion from : ${user}`).setDescription(`${message}`).setColor("Green").setTimestamp();

        const res = webhook.send({ content: `<@&1470412330214097050>`, embeds: [Embed] });

        if (res) return true;
        return false;
    } catch (err) {
        Print("[ERROR] : " + err, "Red");
    }
}

export function CmdError() {
    try {
        return new EmbedBuilder()
            .setDescription("An error has occurred, please use this command later. Or contact support.")
            .setColor("Red")
            .setTimestamp()
    } catch (err) {
        Print("[CMDERROR] : " + err, "Red")
    }
}

export const incorrectformcmd = new EmbedBuilder().setDescription("Incorrect use of command!").setColor("Red")