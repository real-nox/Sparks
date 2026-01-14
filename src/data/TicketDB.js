const { Schema, model } = require("mongoose");

const TicketSC = new Schema({
    guildId: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true
    },
    categoryId: {
        type: String,
        required: false
    },
    transcriptId: {
        type: String,
        required: false
    },
    staffT: {
        type: String,
        required: false
    }
});

const TicketS = model("Tickets", TicketSC);

module.exports = { TicketS };