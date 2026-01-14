const { EmbedBuilder, ChannelType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { Print } = require("../handler/extraHandler");
const { ErrorLog } = require("../handler/logsHanlder");

class TicketSystem {
    constructor(interaction, client) {
        this.interaction = interaction;
        this.client = client;

        this.guild = interaction.guild;
    }

    //Creation of ticket
    async createT(ticketConfig) {
        try {
            let { title, text, channel, category, transcription, btitle, bcolor, staff } = ticketConfig;
            if (title && text && channel) {
                //DB considering that the admin hasn't setup the ticket system yet

                //Defining new replacements which will be described in docs later
                text = text.replace('$n', '\n')

                const TXTEmbed = new EmbedBuilder()
                    .setTitle(`${title}`)
                    .setDescription(`${text}`)
                    .setFooter({ text: this.interaction.client.user.username })

                const createBTN = new ButtonBuilder()
                    .setCustomId(`ticket-${this.guild.id}-${channel.id}`)
                    .setLabel(`${btitle || "Create Ticket"}`)
                if (!bcolor || bcolor === "Success")
                    createBTN.setStyle(ButtonStyle.Success)
                if (bcolor === "Danger")
                    createBTN.setStyle(ButtonStyle.Danger)
                if (bcolor === "Primary")
                    createBTN.setStyle(ButtonStyle.Primary)
                if (bcolor === "Secondary")
                    createBTN.setStyle(ButtonStyle.Secondary)

                const row = new ActionRowBuilder().setComponents(createBTN)
                channel.send({ embeds: [TXTEmbed], components: [row] });

                if (category) {

                } else {
                    //category = this.guild.channels.create({type : ChannelType.GuildCategory, name : "Tickets"});
                }
            }
            await this.interaction.reply("Creating ticket")
        } catch (error) {
            Print("[TICKETCLASST] " + error, "Red");
            ErrorLog("TICKETCLASST", error);
        }
    }

    openT() {

    }

    closeT() {

    }

    transcriptT() {

    }
}

module.exports = { TicketSystem }