export default class Kerfuffle_Game {
    constructor(guild_id, channel_id, user, type = "normal") {
        this.guild_id = guild_id
        this.channel_id = channel_id
        this.gameStarter = user

        this.time = Date.now()
        this.teamA = []
        this.teamB = []

        this.victim = null
        this.victorian = null
        this.winner = null

        this.type = type
    }

    Start_Game() {

    }
}