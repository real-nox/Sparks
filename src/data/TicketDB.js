const { Schema, model } = require("mongoose");
const { Print } = require("../handler/extraHandler");
const { ErrorLog } = require("../handler/logsHanlder");

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

async function getTCol(DB, guildID) {
    const TicketR = await DB.findOne({ guildId: guildID });

    if (!TicketR) return false;
    return TicketR;
}

async function createTCol(DB, guildID, ticketConfig) {
    try {
        let { channel, category, transcription, staff } = ticketConfig;

        let res = await DB.create({ guildId: guildID, channelId: channel.id, categoryId: category.id, transcriptId: transcription.id, staffT: (staff.id || null) })
        if (res)
            return true;
    } catch (error) {
        Print("[TICKETCreateC] " + error, "Red");
        ErrorLog("TICKETCreateC", error);
    }
}

module.exports = { TicketS, getTCol, createTCol };