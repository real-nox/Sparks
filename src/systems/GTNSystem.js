import { EmbedBuilder } from "discord.js"
import Mini_GamesDB from "../data/Mini_GamesDB.js"
import { Print } from "../handler/extraHandler.js"
import { EventLog } from "./LogSystem.js"

export default class GTNGame {
    constructor(msg, client, startnbm, endnbr) {
        this.msg = msg
        this.start_Interval = startnbm
        this.end_Interval = endnbr
        this.db = new Mini_GamesDB(msg.guild.id, msg.channel.id, "GTN")
        this.client = client

        this.guessN = null
        this.newstart = null
        this.newend = null
        this.listener = null
        this.msgHandler = null

        this.gameOn = false
    }

    randomiseN() {
        return this.guessN = Math.floor(Math.random() * (this.end_Interval - this.start_Interval + 1)) + this.start_Interval
    }

    hintInterval() {
        const shrinkAmount = Math.floor((this.end_Interval - this.start_Interval) * 0.2);

        if (game.answer > (game.min + game.max) / 2) {
            game.min += shrinkAmount;
        } else {
            game.max -= shrinkAmount;
        }
    }

    async Start() {
        const started = await this.db.setGame();

        const ErrEmbed = new EmbedBuilder().setColor("Red");

        if (!started) {
            ErrEmbed.setDescription("```Something unexpected happened```")
            return this.msg.reply({ embeds: [ErrEmbed] });
        }

        this.randomiseN()

        Print("[GTN] : Startup", "Green");
        EventLog(`GTN event has started : \n- **Server name :** \`${this.msg.guild.name}\`\n- **Server ID :** \`${this.msg.guild.id}\`\n- **Organisator :**${this.msg.author}`)

        const messageEmbed = new EmbedBuilder()
            .setColor("Random")
            .setThumbnail(this.msg.guild.iconURL({ dynamic: true, size: 1024 }))
            .setDescription(`Welcome to Guess the Number Game!\n\n**Guess the number between** ${this.start_Interval} - ${this.end_Interval}`)
            .setTimestamp();
        this.msg.channel.send({ embeds: [messageEmbed] })
        await this.Game()
    }

    async Game() {
        if (!this.gameOn) {
            this.gameOn = true
            this.Messagehandler()
            //setInterval(() => this.hintInterval(), 1000)
        }
    }

    Messagehandler() {
        this.msgHandler = async (msg) => {
            if (msg.author.bot) return
            if (msg.channel.id !== this.msg.channel.id) return

            if (!(msg.content.includes("gtn end") && msg.author === this.msg.author)) {

                let guess = parseInt(msg)
                console.log(guess)
                console.log(this.guessN)
                if (guess > this.guessN)
                    await msg.react("⏬")
                if (guess < this.guessN)
                    await msg.react("⏫")
                if (guess === this.guessN) {
                    await msg.react("🏆")
                    return this.Winner(msg.author)
                }
            }
        }

        this.listener = async (msg) => await this.msgHandler(msg)
        this.client.on("messageCreate", this.listener);
    }

    Winner(winner) {
        if (this.listener) {
            this.client.off("messageCreate", this.listener)
            this.listener = null
        }

        this.gameOn = false
        this.msgHandler = null

        this.msg.channel.send({ embeds: [new EmbedBuilder().setColor("Gold").setTimestamp().setDescription(`Congratulations ${winner}!!\n- You have won\n\n-# Guessed number : \`${this.guessN}\``).setThumbnail(winner.displayAvatarURL({ dynamic: true, size: 1024 }))] })
    }

    async Stop() {
        this.guessN = null
        this.newstart = null
        this.newend = null
        this.listener = null
        this.msgHandler = null

        this.gameOn = false
        await this.db.deleteGame()
    }
}