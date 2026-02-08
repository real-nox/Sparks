import { DB } from "../handler/dbHandler.js";
import { Print } from "../handler/extraHandler.js"
import { ErrorLog } from "../systems/LogSystem.js";

export default class Mini_GamesDB {
    /**
     * @param {*} gamename should be either : `RGL`....
     */
    constructor(guildID, channelID, gamename) {
        this.data = DB
        this.guildID = guildID
        this.channelID = channelID
        this.gameN = gamename
    }

    async getOngoingGame() {
        try {
            let { data } = await this.data.from("games")
                .select()
                .eq("status", "ongoing")
                .eq("guild_id", this.guildID)
                .eq("channel_id", this.channelID)

            if (!data.length) return false
            return data[0]
        } catch (err) {
            Print("[GETGame] " + err, "Red");
            ErrorLog("GETGame", err);
        }
    }

    async setGame() {
        try {
            const ongoing_game = await this.getOngoingGame();

            if (!ongoing_game) {
                let { error } = await this.data.from("games")
                    .insert({ guild_id: this.guildID, channel_id: this.channelID, gameName: this.gameN })

                if (error) return false;
                return true;
            }
        } catch (err) {
            Print("[SETGAME] " + err, "Red");
            ErrorLog("SETGAME", err);
        }
    }

    /**
     * @param {*} Winner Must be { id: user_id }
     * @returns
     */
    async addGameWinner(Winner) {
        try {
            let ongoing_game = await this.getOngoingGame();

            let winners = Array.isArray(ongoing_game.winners) ? ongoing_game.winners : []

            winners.push(Winner)
            if (ongoing_game) {
                let { error } = await this.data.from("games")
                    .update({ winners })
                    .eq("status", "ongoing")
                    .eq("guild_id", this.guildID)
                    .eq("channel_id", this.channelID)

                if (error) throw error
            }
        } catch (err) {
            Print("[SETGAMEWINNER] " + err, "Red");
            ErrorLog("SETGAMEWINNER", err);
        }
    }

    async endGame() {
        try {
            const ongoing_game = await this.getOngoingGame();

            if (ongoing_game) {
                let { error } = await this.data.from("games")
                    .update({ status: "ended" })
                    .eq("status", "ongoing")
                    .eq("guild_id", this.guildID)
                    .eq("channel_id", this.channelID)

                if (error) return false;
                return;
            }
        } catch (err) {
            Print("[DELETEGAME] " + err, "Red");
            ErrorLog("DELETEGAME", err);
        }
    }

    async deleteGame() {
        try {
            const ongoing_game = await this.getOngoingGame();

            if (ongoing_game) {
                let { error } = await this.data.from("games")
                    .delete()
                    .eq("status", "ongoing")
                    .eq("guild_id", this.guildID)
                    .eq("channel_id", this.channelID)

                if (error) return false;
                return;
            }
        } catch (err) {
            Print("[DELETEGAME] " + err, "Red");
            ErrorLog("DELETEGAME", err);
        }
    }
}