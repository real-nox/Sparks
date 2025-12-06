const { ActivityType } = require("discord.js");

module.exports = {
    name : "clientReady",
    eventrun(client) {
        console.log("Hey chef I'm on!! And ur so cool ikr");
        client.user.setPresence({ activities: [{ name: "Getting coded by ranox", type: ActivityType.Playing }] });
    }
}