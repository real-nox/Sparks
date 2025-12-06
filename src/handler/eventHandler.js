const colors = require("colors")
const fs = require("fs");
const path = require("path");

let events = "____________"
function eventHandler(client) {
    try {
        const eventsFolder = path.join(__dirname, '../events');
        const eventsFiles = fs.readdirSync(eventsFolder).filter((file) => file.endsWith(".js"));

        for (const file of eventsFiles) {
            
            const filepath = path.join(eventsFolder, file)
            const event = require(filepath)
            if (event.once) {
                client.once(event.name, (...args) => event.eventrun(client, ...args))
            } else {
                client.on(event.name, (...args) => event.eventrun(client, ...args));
            }
            events+="\n"+file
        }

        console.log(colors.red(events))
    } catch (err) {
        console.log("[ERROR] : ", err)
    }
}

module.exports = {eventHandler}