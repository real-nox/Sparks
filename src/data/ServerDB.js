import { Print } from "../handler/extraHandler.js"
import { DB } from "../handler/dbHandler.js";
import { ErrorLog } from "../systems/LogSystem.js";

export default class ServerDB {
    constructor(guildId) {
        this.db = DB
        this.guildId = guildId
    }

    //Guild
    async setGuild() {
        try {
            const { error } = await this.db.from("guilds")
                .insert({ guild_id: this.guildId });

            if (error) throw error;

            return;
        } catch (err) {
            Print("[SERVERDB] " + err, "Red");
            ErrorLog("SERVERDB", err);
        }
    }

    async getGuild() {
        try {
            const { data, error } = await this.db.from("guilds")
                .select()
                .eq("guild_id", this.guildId);

            if (error || !data.length) return await this.setGuild();

            return data;
        } catch (err) {
            Print("[SERVERDB] " + err, "Red");
            ErrorLog("SERVERDB", err);
        }
    }

    //Prefix
    async getPrefix() {
        try {
            const data = await this.getGuild()

            return data[0]?.prefix;
        } catch (err) {
            Print("[SERVERDB] " + err, "Red");
            ErrorLog("SERVERDB", err);
        }
    }

    async setPrefix(prefix) {
        try {
            await this.getPrefix()

            const { error } = await this.db.from("guilds")
                .update({ prefix: prefix })
                .eq("guild_id", this.guildId);

            if (error) throw error

            return true
        } catch (err) {
            Print("[SERVERDB] " + err, "Red");
            ErrorLog("SERVERDB", err);
        }
    }

    //Staff
    async getStaffR() {
        try {
            const data = await this.getGuild();

            return data[0]?.staffGuild
        } catch (err) {
            Print("[SERVERDB] " + err, "Red");
            ErrorLog("SERVERDB", err);
        }
    }

    async setStaffR(staffRID) {
        try {
            await this.getPrefix()

            const { error } = await this.db.from("guilds")
                .update({ staffGuild: staffRID })
                .eq("guild_id", this.guildId);

            if (error) throw error

            return true
        } catch (err) {
            Print("[SERVERDB] " + err, "Red");
            ErrorLog("SERVERDB", err);
        }
    }

    //Ticket staff
    async getTStaffR() {
        try {
            const data = await this.getGuild();

            return data[0]?.staffT_id
        } catch (err) {
            Print("[SERVERDB] " + err, "Red");
            ErrorLog("SERVERDB", err);
        }
    }

    async setTStaffR(staffRID) {
        try {
            await this.getPrefix()

            const { error } = await this.db.from("guilds")
                .update({ staffT_id: staffRID })
                .eq("guild_id", this.guildId);

            if (error) throw error

            return true
        } catch (err) {
            Print("[SERVERDB] " + err, "Red");
            ErrorLog("SERVERDB", err);
        }
    }
}