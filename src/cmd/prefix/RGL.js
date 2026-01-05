const { EmbedBuilder } = require("discord.js");
const RGLGame = require("../../classes/RGLFunction")
const { getRGameOngoing } = require("../../data/RGLDB")
const { DB } = require("../../handler/dbHandler")

let RGL;

module.exports = {
    name: "rgl",
    async prerun(mg, client) {
        const guildID = mg.guild.id;
        const channelID = mg.channel.id;

        const args = mg.content.toLowerCase().split(" ");
        let cmdType = args[1];

        const ErrEmbed = new EmbedBuilder().setColor("Red");

        if (!cmdType) {
            ErrEmbed.setDescription("```Unknown command!```");
            return mg.reply({ embeds: [ErrEmbed] });
        }

        cmdType = cmdType.includes("-", 0) ? cmdType = cmdType.slice(1) : cmdType;

        let Game = await getRGameOngoing(DB, guildID, channelID);

        switch (cmdType) {
            case "start":
            case "s":
                let rounds = parseInt(args[2]);
                let time = parseInt(args[3]);
                let winnersC = parseInt(args[4]);

                if (Game) return mg.reply("# There is an ongoing game!");

                if ((!rounds || !time) || ((rounds > 20 || rounds < 2) || (time > 60 || time < 10) || (winnersC > 3 || winnersC < 1))) {
                    ErrEmbed.setDescription("```Command format is incorrect !rgl -start <rounds> <duration in sec> <(winners) optional 3 by default>```");
                    return mg.reply({ embeds: [ErrEmbed] });
                }

                RGL = new RGLGame(client, mg, DB, rounds, time, winnersC);
                await RGL.Starter();
                break;

            case "stop":
            case "end":
                if (!Game) {
                    ErrEmbed.setDescription("```There is no ongoing game right now.```");
                    return mg.reply({ embeds: [ErrEmbed] });;
                }

                mg.reply("## Ending Game!")
                await RGL.GameStart(true);
                break;

            default:
                ErrEmbed.setDescription("```Unknown command!```");
                mg.reply({ embeds: [ErrEmbed] });;
                break;
        }
    }
}