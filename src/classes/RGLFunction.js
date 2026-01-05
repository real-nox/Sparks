const { EmbedBuilder } = require("discord.js");
const { gameRStart, saveRWinners, gameREnd, deleteRGL } = require("../data/RGLDB");
const { delay, Print } = require("../handler/extraHandler");

let current = (Math.random() < 0.5) ? "Red" : "Green";

function NEXTLight() {
    return current = current === "Red" ? "Green" : "Red";
}

let participants = new Map();
let losers = new Map();

let i = 0;
let listener;

class RGLGame {

    constructor(client, mg, DB, rounds, time, winnersC) {
        this.guildID = mg.guild.id;
        this.channelID = mg.channel.id;
        this.db = DB;
        this.mg = mg;

        this.client = client;

        //Game Settings
        this.rounds = rounds;

        this.time = time;
        this.timerRed;
        this.timerGreen;

        this.winnerC = winnersC ? winnersC : 3
        this.light;
        this.gameon = false;
    }

    async Starter() {
        const started = await gameRStart(this.db, this.guildID, this.channelID);

        const ErrEmbed = new EmbedBuilder().setColor("Red");

        if (!started) {
            ErrEmbed.setDescription("```Something unexpected happened```")
            return this.mg.reply({ embeds: [ErrEmbed] });
        }

        this.mg.reply("## Starting");
        this.gameon = true;
        Print("[RGL] : Startup", "Green");

        await this.GameStart();
    }

    async GameStart(stop = false) {

        if (this.gameon == true) {

            if (!stop) {
                listener = async (msg) => {
                    if (msg.channel.id === this.channelID) {
                        if (msg.author.bot) return;

                        if (!(msg.content.includes("rgl -end") && this.mg.author == msg.author)) {
                            if (this.light === "Red") {
                                msg.react("☠️");
                                this.RedLight(msg);
                            } else if (this.light === "Green") {
                                this.GreenLight(msg);
                            }
                        }
                    }
                }

                this.client.on("messageCreate", listener);

                for (i = 0; i < this.rounds; i++) {

                    this.light = NEXTLight();
                    this.mg.channel.send(`## Round ${i + 1}`);

                    await delay(1)
                    if (this.light == "Red") {
                        this.mg.channel.send("## :red_circle: RED LIGHT");
                        this.timerRed = Math.floor(Math.random() * this.time) + 3;
                        await delay(this.timerRed);
                    } else {
                        this.mg.channel.send("## :green_circle: GREEN LIGHT");
                        this.timerGreen = Math.floor(Math.random() * this.time) + 5;
                        await delay(this.timerGreen);
                    }
                }
            }

            if (stop) i = this.rounds;

            if (i == this.rounds) {
                if (listener) this.client.off("messageCreate", listener);
                await this.WinnersLight();
                this.gameon = false;
                return await this.GameEnd();
            }
        }
    }

    RedLight(msg) {
        if (!losers.has(msg.author.id)) {
            if (participants.has(msg.author.id)) {
                participants.delete(msg.author.id)
            }

            losers.set(msg.author.id, 0);
        }
    }

    GreenLight(msg) {
        if (!losers.has(msg.author.id)) {
            if (!participants.has(msg.author.id)) {
                participants.set(msg.author.id, 1);
            } else {
                let count = participants.get(msg.author.id);
                participants.set(msg.author.id, count + 1);
            }
        }
    }

    async WinnersLight() {

        if (participants.size === 0 && losers.size === 0) {
            await deleteRGL(this.db, this.guildID, this.channelID)
            return this.mg.channel.send("## 😞 No one participated!");
        }

        if (participants.size > 0) {
            let winnersC = Math.min(participants.size, this.winnerC);

            let participantsArray = [...participants.entries()];
            participantsArray.sort((a, b) => b[1] - a[1]);

            let medals = ["🥇", "🥈", "🥉"]
            const EmbedWin = new EmbedBuilder()
                .setColor("Gold").setTitle("👑 Winners 👑");

            let topwinners = participantsArray.slice(0, winnersC).map(([id, count]) => ({ id, count }));

            topwinners.forEach(async ({ id, count }, index) => {
                EmbedWin.addFields({ name: " ", value: `${medals[index]} : <@${id}> | points : ${count}` });
                await saveRWinners(this.db, this.guildID, this.channelID, id);
            });

            for (const { id } of topwinners) participants.delete(id);

            this.mg.channel.send({ embeds: [EmbedWin] });
            if (participants.size > winnersC) {
                const EmbedParti = new EmbedBuilder()
                    .setColor("Green").setTitle("🛡️ Survivors 🛡️");

                let partiMSG = participantsArray.slice(winnersC).map((s, i) => `${i + 1} : <@${s[0]}> | points : ${s[1]}`).join("\n")

                EmbedParti.addFields({ name: "", value: partiMSG });

                this.mg.channel.send({ embeds: [EmbedParti] });
                participants = [];
            }
        }

        if (losers.size > 0) {
            const EmbedLoser = new EmbedBuilder()
                .setColor("DarkButNotBlack").setTitle("🪦 Eliminated 🪦")

            let losersArrayTXT = [...losers.entries()].map((s, i) => `${i + 1} : <@${s[0]}> | points : ${s[1]}`).join("\n")
            EmbedLoser.addFields({ name: "", value: losersArrayTXT });

            this.mg.channel.send({ embeds: [EmbedLoser] });

            losersArrayTXT = [];
        }
    }

    async GameEnd() {
        await gameREnd(this.db, this.guildID, this.channelID);

        losers.clear();
        participants.clear();

        Print("[RGL] : ended", "Grey")
    }
}

module.exports = RGLGame