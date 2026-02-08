import { ErrorLog } from "../systems/LogSystem.js"
import { Print } from "../handler/extraHandler.js"
import { DB } from "../handler/dbHandler.js";
import ServerDB from "./ServerDB.js";

export async function getTCol(guildID) {
    try {
        let { data, error } = await DB.from("tickets_g")
            .select()
            .eq("guild_id", guildID);

        if (error) throw error

        return data[0];
    } catch (error) {
        Print("[TICKETgetT] " + error, "Red");
        ErrorLog("TICKETgetT", error);
    }
}

export async function createTCol(guildID, ticketConfig) {
    try {
        let { channel, category, transcription, staff } = ticketConfig;

        if (staff !== null || staff) {
            const oldTstaff = new ServerDB(guildID).getTStaffR()
            if (staff !== oldTstaff) {
                await new ServerDB(guildID).setTStaffR(staff)
            }
        }

        let { error } = await DB
            .from("tickets_g")
            .insert({ guild_id: guildID, T_channel_id: channel.id, T_category_id: category.id, T_transcription_id: transcription.id })

        if (error) throw error

        return true;
    } catch (error) {
        Print("[TICKETCreateC] " + error, "Red");
        ErrorLog("TICKETCreateC", error);
    }
}

export async function updateTicket(guild_id, prop, value) {
    try {

        let { error } = await DB.from("tickets_g")
            .update({ [prop]: value })
            .eq("guild_id", guild_id)

        if (error) throw error
        return
    } catch (error) {
        Print("[updateTicket] " + error, "Red");
        ErrorLog("updateTicket", error);
    }
}

export async function getUTicket(guildID, userId) {
    try {
        let { data, error } = await DB.from("ticket_user")
            .select()
            .eq("guild_id", guildID)
            .eq("user_id", userId)
            .eq("status", "ongoing")
            .order("created_at")
            .limit(1)

        if (error) throw error

        return data
    } catch (error) {
        Print("[addTicket] " + error, "Red");
        ErrorLog("addTicket", error);
    }
}

export async function getUTicketByChannel(guildID, channelId) {
    try {
        let { data, error } = await DB.from("ticket_user")
            .select()
            .eq("guild_id", guildID)
            .eq("id_channel", channelId)
            .eq("status", "ongoing")
            .order("created_at")
            .limit(1)

        if (error) throw error

        return data[0]
    } catch (error) {
        Print("[addTicket] " + error, "Red");
        ErrorLog("addTicket", error);
    }
}

export async function addUTicket(ticketConfig) {
    try {
        let { guild_id, userId, channelid } = ticketConfig;

        let { error } = await DB.from("ticket_user")
            .insert({ guild_id: guild_id, user_id: userId, id_channel: channelid })

        if (error) throw error
        return
    } catch (error) {
        Print("[addTicket] " + error, "Red");
        ErrorLog("addTicket", error);
    }
}

export async function updateUTicket(guild_id, userId, prop, value) {
    try {

        let { error } = await DB.from("ticket_user")
            .update({ [prop]: value })
            .eq("guild_id", guild_id)
            .eq("user_id", userId)
            .eq("status", "ongoing")

        if (error) throw error
        return
    } catch (error) {
        Print("[updateaddTicket] " + error, "Red");
        ErrorLog("updateTicket", error);
    }
}