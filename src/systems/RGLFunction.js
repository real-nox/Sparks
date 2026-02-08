import { EmbedBuilder } from "discord.js";
import { delay, Print } from "../handler/extraHandler.js";
import { ErrorLog, EventLog } from "./LogSystem.js";
import Mini_GamesDB from "../data/Mini_GamesDB.js";

export default class RGLGame {

    constructor(client, mg, RGLConfig) {
        this.guildID = mg.guild.id;
        this.channelID = mg.channel.id;
        this.mg = mg;
        this.db = new Mini_GamesDB(this.guildID, this.channelID, "RGL")

        this.client = client;

        //Game Settings
        this.rounds = RGLConfig.rounds;
        this.time = RGLConfig.time;
        this.timerRed;
        this.timerGreen;

        this.current = Math.random() < 0.5 ? "Red" : "Green";

        this.winnerC = RGLConfig.winnersC ? RGLConfig.winnersC : 3
        this.light;
        this.gameon = false;
        this.list = true;

        this.i = 0;
        //Setting up teams
        this.participants = new Map();
        this.losers = new Map();

        this.listener = null;
        this.handlermsg = null;
    }

    async Starter() {
        try {
            const started = await this.db.setGame();

            const ErrEmbed = new EmbedBuilder().setColor("Red");

            if (!started) {
                ErrEmbed.setDescription("```Something unexpected happened```")
                return this.mg.reply({ embeds: [ErrEmbed] });
            }

            this.mg.reply("## Starting RGL");
            this.gameon = true;
            Print("[RGL] : Startup", "Green");

            EventLog(`RGL event has started : \n- **Server name :** \`${this.mg.guild.name}\`\n- **Server ID :** \`${this.guildID}\`\n- **Organisator :**${this.mg.author}`)

            //Event
            await this.GameStart();
        } catch (error) {
            Print("[RGLC] " + error, "Red");
            ErrorLog("RGLC", error);
            await this.db.deleteGame()
        }
    }

    async GameStart(stop = false) {
        try {
            if (!this.gameon) return;

            this.MessageHandler();
            await delay(1);
            await this.Rounds();

            await this.FinishGame(stop);
        } catch (error) {
            Print("[RGLC] " + error, "Red");
            ErrorLog("RGLC", error);
            await this.db.deleteGame()
        }
    }

    MessageHandler() {
        this.handlermsg = async (msg) => {
            if (msg.author.bot) return;
            if (msg.channel.id === this.channelID) {

                if (!(msg.content.includes("rgl -end") && this.mg.author === msg.author)) {
                    if (this.light === "Red") {
                        msg.react("🪦");
                        this.RedLight(msg);
                    } else if (this.light === "Green") {
                        this.GreenLight(msg);
                    }
                }
            }
        }

        this.listener = (msg) => this.handlermsg(msg)
        this.client.on("messageCreate", this.listener);
    }

    async Rounds() {
        for (this.i = 1; this.i <= this.rounds; this.i++) {

            this.light = this.NEXTLight();
            this.mg.channel.send(`## Round ${this.i}\n- Everyone can join!`);

            await delay(1)
            if (this.light === "Red") {
                this.mg.channel.send({
                    embeds:
                        [new EmbedBuilder().setTitle("RED LIGHT").setDescription("🔴 Red Light! Don't TALK or you'll be eliminated!!")]
                });

                this.timerRed = Math.floor(Math.random() * this.time) + 3;
                await delay(this.timerRed);

                if (this.i < this.rounds) {
                    await this.WinnersLight();
                    await delay(1);
                }
            } else {
                this.mg.channel.send({
                    embeds:
                        [new EmbedBuilder().setTitle("GREEN LIGHT").setDescription("🟢 Green Light! TALK to win.")]
                });

                this.timerGreen = Math.floor(Math.random() * this.time) + 5;
                await delay(this.timerGreen);

                if (this.i < this.rounds) {
                    await this.WinnersLight();
                    await delay(1);
                }
            }
        }
    }

    async FinishGame(stop) {
        if (stop) this.i = this.rounds + 1;

        if (this.i > this.rounds) {
            this.list = false;
            await this.GameEnd();
            return;
        }
    }

    NEXTLight() {
        this.current = this.current === "Red" ? "Green" : "Red";
        return this.current;
    }

    RedLight(msg) {
        try {
            if (!this.losers.has(msg.author.id)) {
                if (this.participants.has(msg.author.id)) {
                    this.participants.delete(msg.author.id)
                }

                this.losers.set(msg.author.id, 0);
            }
        } catch (error) {
            Print("[RGLC] " + error, "Red");
            ErrorLog("RGLC", error);
        }
    }

    GreenLight(msg) {
        try {
            if (!this.losers.has(msg.author.id)) {
                if (!this.participants.has(msg.author.id)) {
                    this.participants.set(msg.author.id, 1);
                } else {
                    let count = this.participants.get(msg.author.id);
                    this.participants.set(msg.author.id, count + 1);
                }
            }
        } catch (error) {
            Print("[RGLC] " + error, "Red");
            ErrorLog("RGLC", error);
        }
    }

    async WinnersLight() {
        try {
            if (!this.list) {
                if (this.participants.size === 0 && this.losers.size === 0) {
                    await this.db.deleteGame()
                    return this.mg.channel.send("## 😞 No one participated!");
                }
            }

            if (this.participants.size > 0) {
                let participantsArray = [...this.participants.entries()];
                participantsArray.sort((a, b) => b[1] - a[1]);

                let winnersC;
                if (!this.list) {
                    winnersC = Math.min(this.participants.size, this.winnerC);
                    let medals = ["🥇", "🥈", "🥉"]
                    const EmbedWin = new EmbedBuilder()
                        .setColor("Gold").setTitle("👑 Winners 👑");

                    let topwinners = participantsArray.slice(0, winnersC).map(([id, count]) => ({ id, count }));

                    topwinners.forEach(async ({ id, count }, index) => {
                        EmbedWin.addFields({ name: " ", value: `${medals[index]} : <@${id}> \`${count}\`` });
                        await this.db.addGameWinner({ id: id });
                    });

                    for (const { id } of topwinners) this.participants.delete(id);

                    this.mg.channel.send({ embeds: [EmbedWin] });
                }
                if (this.participants.size > winnersC || this.list) {
                    const EmbedParti = new EmbedBuilder()
                        .setColor("Green").setTitle("🛡️ Survivors 🛡️");

                    let partiMSG = participantsArray.slice(winnersC || 0).map((s, i) => `${i + 1} <@${s[0]}> : \`${s[1]}\``).join("\n")

                    EmbedParti.addFields({ name: "", value: partiMSG });

                    this.mg.channel.send({ embeds: [EmbedParti] });

                    participantsArray = [];
                }
            }

            if (this.losers.size > 0) {
                if (this.participants.size === 0)
                    await this.db.deleteGame()
                const EmbedLoser = new EmbedBuilder()
                    .setColor("DarkButNotBlack").setTitle("🪦 Eliminated 🪦")

                let losersArrayTXT = [...this.losers.entries()].map((s, i) => `${i + 1} <@${s[0]}> : \`${s[1]}\``).join("\n")
                EmbedLoser.addFields({ name: "", value: losersArrayTXT });

                this.mg.channel.send({ embeds: [EmbedLoser] });
                losersArrayTXT = [];
            }
        } catch (error) {
            Print("[RGLC] " + error, "Red");
            ErrorLog("RGLC", error);
        }
    }

    async GameEnd() {
        try {
            this.gameon = false;

            if (this.listener) {
                this.client.off("messageCreate", this.listener)
                this.listener = null;
            }

            await this.WinnersLight();

            await this.db.endGame();

            if (this.losers.size > 0) this.losers.clear();
            if (this.participants.size > 0) this.participants.clear();

            Print("[RGL] : ended", "Grey")
        } catch (error) {
            Print("[RGLC] " + error, "Red");
            ErrorLog("RGLC", error);
        }
    }
}