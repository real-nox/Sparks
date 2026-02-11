import { EmbedBuilder } from "discord.js";
import Mini_GamesDB from "../../../data/Mini_GamesDB.js";
import { Print } from "../../../handler/extraHandler.js";
import { ErrorLog } from "../../../systems/LogSystem.js";
import GTNGame from "../../../systems/GTNSystem.js";

let GTN = null
export default {
    name: "gtn",
    aliases: ["guessthenumber"],
    staff: true,
    async prerun(msg, client) {
        try {
            const guildID = msg.guild.id
            const channelID = msg.channel.id

            const args = msg.content.toLowerCase().split(" ")

            let cmdType = args[1];

            const ErrEmbed = new EmbedBuilder().setColor("Red");

            if (!cmdType) {
                ErrEmbed.setDescription("```Unknown command!```");
                return msg.reply({ embeds: [ErrEmbed] });
            }
            cmdType = cmdType.includes(" ", 0) ? cmdType = cmdType.slice(1) : cmdType;

            let GTNdb = new Mini_GamesDB(guildID, channelID, "GTN")
            let Game = await GTNdb.getOngoingGame();

            switch (cmdType) {
                case "start":
                case "s":
                    let start_Inter_nbr = parseInt(args[2])
                    let end_Inter_nbr = parseInt(args[3])

                    if (Game) return msg.reply("# There is an ongoing game!");

                    const isInvalidRange =
                        !start_Inter_nbr ||
                        !end_Inter_nbr ||
                        start_Inter_nbr < 2 ||
                        end_Inter_nbr < 2 ||
                        start_Inter_nbr > 5000 ||
                        end_Inter_nbr > 5000 ||
                        start_Inter_nbr > end_Inter_nbr;

                    console.log(isInvalidRange);

                    if (isInvalidRange) {
                        ErrEmbed.setDescription("```Command format is incorrect !gtn start <start> <end>```");
                        return msg.reply({ embeds: [ErrEmbed] });
                    }

                    GTN = new GTNGame(msg, client, start_Inter_nbr, end_Inter_nbr)
                    await GTN.Start()
                    break;
                case "stop":
                case "end":
                    msg.channel.send("Ending game!")
                    if (GTN)
                        await GTN.Stop()
                    else 
                        await GTNdb.endGame()
                    break
                default:
                    ErrEmbed.setDescription("```Unknown command!```");
                    msg.reply({ embeds: [ErrEmbed] });;
                    break;
            }
        } catch (error) {
            Print("[GTN] " + error, "Red");
            ErrorLog("GTN", error);
        }
    }
}