import { DB } from "../handler/dbHandler.js";
import { Print } from "../handler/extraHandler.js";
import { ErrorLog } from "../systems/LogSystem.js";

const max_coins = process.env.max_coins
export default class Economy {
    constructor(user_id, guild_id) {
        this.db = DB
        this.userId = user_id
        this.guildId = guild_id
    }

    async setEcoUser() {
        try {
            const { error } = await this.db.from("economy")
                .insert({ guild_id: this.guildId, user_id: this.userId });

            if (error) throw error;

            return;
        } catch (error) {
            Print("[SetEco]", error, "Red");
            ErrorLog("SetEco", error);
        }
    }

    async getUserEco() {
        try {
            const { data, error } = await this.db.from("economy")
                .select()
                .eq("guild_id", this.guildId)
                .eq("user_id", this.userId)

            if (error || !data.length)
                await this.setEcoUser()

            return data;
        } catch (error) {
            Print("[GetEco]", error, "Red");
            ErrorLog("GetEco", error);
        }
    }

    async getBalance() {
        try {
            const data = await this.getUserEco()

            return data[0].balance
        } catch (error) {
            Print("[Getbal]", error, "Red");
            ErrorLog("Getbal", error);
        }
    }

    //Earn Sparks
    /**
     * @param {*} type earnc, dailyc, flipc
     * @returns 
     */
    async setSparks(amount, type, cooldown) {
        try {
            const data = await this.getUserEco()

            let oldBal = data[0].balance
            if (oldBal + amount >= max_coins) {
                const { error } = await this.db.from("economy")
                    .update({ balance: max_coins })
                    .eq("guild_id", this.guildId)
                    .eq("user_id", this.userId);

                if (error) throw error
            } else {
                const { error } = await this.db.from("economy")
                    .update({ balance: amount, [type]: cooldown })
                    .eq("guild_id", this.guildId)
                    .eq("user_id", this.userId);

                if (error) throw error
            }

            return true
        } catch (error) {
            Print("[EARNCDB] " + error, "Red");
            ErrorLog("EARNCDB", error);
        }
    }
}