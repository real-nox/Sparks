const { EmbedBuilder, ChannelType, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags, PermissionFlagsBits } = require("discord.js");
const { Print } = require("../handler/extraHandler");
const { ErrorLog } = require("../handler/logsHanlder");
const { createTCol, TicketS, getTCol } = require("../data/TicketDB");

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

                if (!await getTCol(TicketS, this.guild.id)) {
                    //Defining new replacements which will be described in docs later
                    text = text.replace('$n', '\n')

                    const TXTEmbed = new EmbedBuilder()
                        .setTitle(`${title}`)
                        .setDescription(`${text}`)
                        .setFooter({ text: this.interaction.client.user.username });

                    const createBTN = new ButtonBuilder()
                        .setCustomId(`ticket-${this.guild.id}-${channel.id}`)
                        .setLabel(`${btitle || "Create Ticket"}`);

                    if (!bcolor || bcolor === "Success")
                        createBTN.setStyle(ButtonStyle.Success);
                    if (bcolor === "Danger")
                        createBTN.setStyle(ButtonStyle.Danger);
                    if (bcolor === "Primary")
                        createBTN.setStyle(ButtonStyle.Primary);
                    if (bcolor === "Secondary")
                        createBTN.setStyle(ButtonStyle.Secondary);

                    const row = new ActionRowBuilder().setComponents(createBTN);
                    channel.send({ embeds: [TXTEmbed], components: [row] });

                    if (!category) {
                        category = await this.guild.channels.create({
                            type: ChannelType.GuildCategory,
                            name: "Tickets"
                        });
                    };

                    if (!transcription) {
                        transcription = await this.guild.channels.create({
                            type: ChannelType.GuildText,
                            name: "Ticket-transcripts",
                            permissionOverwrites: [
                                {
                                    id: this.guild.id,
                                    deny: [PermissionFlagsBits.ViewChannel]
                                },
                                {
                                    id: (!staff ? this.interaction.member : staff),
                                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                                }
                            ]
                        });
                    };

                    ticketConfig = { channel, category, transcription, staff };
                    let creationD = await createTCol(TicketS, this.guild.id, ticketConfig);

                    if (creationD) {
                        const ctEmbed = new EmbedBuilder()
                            .setTitle("Ticket setup")
                            .setDescription(
                                `Ticket set!\n- Ticket Channel : ${channel}\n- Ticket Category : ${category.name}\n- Transcription channel/Ticket log channel : ${transcription}\n- Ticket Staff : ${staff ? staff : "Not set yet."}`
                            );

                        await this.interaction.reply({ embeds: [ctEmbed], flags: MessageFlags.Ephemeral });
                    }
                } else {
                    await this.interaction.reply({ content: "There is an already registred ticket!", flags: MessageFlags.Ephemeral });
                }
            }
        } catch (error) {
            Print("[TICKETCreateC] " + error, "Red");
            ErrorLog("TICKETCreateC", error);
        }
    }

    async openT() {
        try {
            //Assumming that user have never opened the ticket
            const ticketSInfo = await getTCol(TicketS, this.guild.id);

            const categoryT = await this.interaction.guild.channels.cache.find(c => c.id === ticketSInfo.categoryId);

            if (!categoryT) {

            }

            await this.interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const TicketChannelU = await this.interaction.guild.channels.create({
                parent: categoryT,
                type: ChannelType.GuildText,
                name: `Ticket-${this.interaction.member.user.username}`,
                permissionOverwrites: [
                    {
                        id: this.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: (!ticketSInfo.staff ? this.interaction.member : ticketSInfo.staff),
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                    },
                    {
                        id: this.interaction.member.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                    }
                ]
            })

            await this.interaction.editReply({ content: `Ticket channel created ${TicketChannelU}`, flags: MessageFlags.Ephemeral })
            await TicketChannelU.send(`${this.interaction.member}`)
        } catch (error) {
            Print("[TICKETOpenC] " + error, "Red");
            ErrorLog("TICKETOpenC", error);
        }
    }

    closeT() {

    }

    transcriptT() {

    }
}

module.exports = { TicketSystem }