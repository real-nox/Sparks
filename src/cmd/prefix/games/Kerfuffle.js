import Kerfuffle_Game from "../../../systems/KerfuffleSystem.js"

export default {
    name: "kerfuffle",
    aliases: ["k"],
    staff: true,
    async prerun(msg) {
       const guild_id = msg.guild.id
       const channel_id = msg.channel.id
       const author_id = msg.author.id

       const KGame = new Kerfuffle_Game(guild_id, channel_id, author_id)
       
       console.log(KGame)
    }
}