import { Print } from "../../../handler/extraHandler.js";
import RGLGame from "../../../systems/RGLFunction.js";
import { EmbedBuilder } from "discord.js";
import { ErrorLog } from "../../../systems/LogSystem.js";
import Mini_GamesDB from "../../../data/Mini_GamesDB.js";

let RGL;

export default {
    name: "rgl",
    staff: true,
    async prerun(mg, client) {
        try {
            const guildID = mg.guild.id;
            const channelID = mg.channel.id;

            const args = mg.content.toLowerCase().split(" ");
            let cmdType = args[1];

            const ErrEmbed = new EmbedBuilder().setColor("Red");

            if (!cmdType) {
                ErrEmbed.setDescription("```Unknown command!```");
                return mg.reply({ embeds: [ErrEmbed] });
            }

            cmdType = cmdType.includes(" ", 0) ? cmdType = cmdType.slice(1) : cmdType;

            let RGLdb = new Mini_GamesDB(guildID, channelID, "RGL")
            let Game = await RGLdb.getOngoingGame();

            switch (cmdType) {
                case "start":
                case "s":
                    let RGLConfig = {
                        rounds: parseInt(args[2]),
                        time: parseInt(args[3]),
                        winnersC: parseInt(args[4])
                    }

                    if (Game) return mg.reply("# There is an ongoing game!");

                    if (
                        (!RGLConfig.rounds || !RGLConfig.time) ||
                        ((RGLConfig.rounds > 20 || RGLConfig.rounds < 2) || (RGLConfig.time > 60 || RGLConfig.time < 10) || (RGLConfig.winnersC > 3 || RGLConfig.winnersC < 1))) {

                        ErrEmbed.setDescription("```Command format is incorrect !rgl -start <rounds> <duration in sec> <(winners) optional 3 by default>```");
                        return mg.reply({ embeds: [ErrEmbed] });
                    }

                    RGL = new RGLGame(client, mg, RGLConfig);
                    await RGL.Starter();

                    break;
                case "stop":
                case "end":
                    if (!Game) {
                        ErrEmbed.setDescription("```There is no ongoing game right now.```");
                        return mg.reply({ embeds: [ErrEmbed] });;
                    }

                    mg.reply("## Ending Game!")
                    if (RGL)
                        await RGL.GameStart(true);
                    else
                        await RGLdb.endGame();
                    break;

                default:
                    ErrEmbed.setDescription("```Unknown command!```");
                    mg.reply({ embeds: [ErrEmbed] });;
                    break;
            }
        } catch (error) {
            Print("[RGL] " + error, "Red");
            ErrorLog("RGL", error);
        }
    }
}