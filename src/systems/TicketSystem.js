import { EmbedBuilder, ChannelType, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags, PermissionFlagsBits } from "discord.js";
import { Print } from "../handler/extraHandler.js";
import { ErrorLog } from "./LogSystem.js";
import { addUTicket, createTCol, getTCol, getUTicket, getUTicketByChannel, updateTicket, updateUTicket } from "../data/TicketDB.js";
import ServerDB from "../data/ServerDB.js";

export class TicketSystem {
    constructor(interaction, client) {
        this.interaction = interaction;
        this.client = client;

        this.guild = interaction.guild;
        this.staffID = null;
        this.ticketSInfo = null
    }

    //Creation of ticket
    async createT(ticketConfig) {
        try {
            let { title, text, channel, category, transcription, btitle, bcolor, staff } = ticketConfig;
            if (title && text && channel) {

                if (!await getTCol(this.guild.id)) {
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
                    let creationD = await createTCol(this.guild.id, ticketConfig);

                    if (creationD) {
                        const ctEmbed = new EmbedBuilder()
                            .setTitle("Ticket setup")
                            .setDescription(
                                `Ticket set!\n- Ticket Channel : ${channel}\n- Ticket Category : ${category.name}\n- Transcription channel/Ticket log channel : ${transcription}\n- Ticket Staff : ${staff ? staff : "Not set yet."}`
                            );

                        await this.interaction.reply({ embeds: [ctEmbed], flags: MessageFlags.Ephemeral });
                    }

                    this.staffID = staff ? staff : null
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
            const ticketSInfo = await getTCol(this.guild.id);

            if (!ticketSInfo)
                return await this.interaction.reply({ content: "Server's Ticket is unfound/not setup anymore.", flags: MessageFlags.Ephemeral })

            const hasTicket = await getUTicket(this.interaction.guild.id, this.interaction.user.id)

            if (hasTicket) {
                if (this.interaction.guild.channels.cache.get(hasTicket[0]?.id_channel))
                    return await this.interaction.reply({ content: "You currently have an open ticket.", flags: MessageFlags.Ephemeral })
                else
                    await updateUTicket(this.interaction.guild.id, this.interaction.user.id, "status", "closed")
            }

            let categoryT = await this.interaction.guild.channels.cache.get(ticketSInfo.T_category_id);

            if (!categoryT) {
                categoryT = await this.interaction.guild.channels.create({ name: "Tickets", type: ChannelType.GuildCategory })
                await updateTicket(this.interaction.guild.id, "T_category_id", categoryT.id)
            }

            await this.interaction.deferReply({ flags: MessageFlags.Ephemeral });

            let T_staff = await new ServerDB(this.guild.id).getTStaffR()

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
                        id: (this.guild.roles.cache.get(T_staff) ? T_staff : this.interaction.member),
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                    },
                    {
                        id: this.interaction.member.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                    }
                ]
            })

            await this.interaction.editReply({ content: `Ticket channel created ${TicketChannelU}`, flags: MessageFlags.Ephemeral })

            const ticketembed = new EmbedBuilder()
                .setDescription("Welcome to this ticket!")
                .setFooter({ text: await this.interaction.client.user.username });

            const closeBtn = new ButtonBuilder()
                .setCustomId(`closeT-${await TicketChannelU.id}-${await this.interaction.member.user.id}`)
                .setEmoji("🔒")
                .setLabel("Close")
                .setStyle(ButtonStyle.Danger)

            const claimBtn = new ButtonBuilder()
                .setCustomId(`claimT-${await TicketChannelU.id}-${await this.interaction.member.user.id}`)
                .setEmoji("📫")
                .setLabel("Claim")
                .setStyle(ButtonStyle.Primary)

            const row = new ActionRowBuilder().addComponents(closeBtn, claimBtn)

            let ticketConfig = {
                guild_id: this.interaction.guild.id,
                userId: this.interaction.user.id,
                channelid: TicketChannelU.id
            }

            await addUTicket(ticketConfig)
            return await TicketChannelU.send({ content: `${await this.interaction.member}`, embeds: [ticketembed], components: [row] })
        } catch (error) {
            Print("[TICKETOpenC] " + error, "Red");
            ErrorLog("TICKETOpenC", error);
        }
    }

    async closeT() {
        try {
            const info = await getUTicketByChannel(this.guild.id, this.interaction.channel.id);

            return await this.interaction.channel.permissionOverwrites.edit(info.user_id, { ViewChannel: false })
        } catch (error) {
            Print("[CLOSET] " + error, "Red");
            ErrorLog("CLOSET", error);
        }
    }

    async reopenT() {
        try {
            const info = await getUTicketByChannel(this.guild.id, this.interaction.channel.id);

            return await this.interaction.channel.permissionOverwrites.edit(info.user_id, { ViewChannel: true })
        } catch (error) {
            Print("[REOPEN] " + error, "Red");
            ErrorLog("REOPEN", error);
        }
    }

    async claimT() {
        try {
            let T_staff = await new ServerDB(this.guild.id).getTStaffR()

            if (!this.guild.roles.cache.get(T_staff) && !this.interaction.member.permissions.has(PermissionFlagsBits.Administrator || PermissionFlagsBits.ManageMessages))
                return await this.interaction.reply({ content: "The staff ticket role is unknown!", flags: MessageFlags.Ephemeral })

            const haspermission = this.interaction.member.roles.cache.has(T_staff) ||
                this.interaction.member.permissions.has(PermissionFlagsBits.Administrator || PermissionFlagsBits.ManageMessages)

            const ticketSInfo = await getUTicketByChannel(this.guild.id, this.interaction.channel.id);

            if (this.interaction.user.id === ticketSInfo.user_id)
                return await this.interaction.reply({ content: "You cannot claim your own ticket!", flags: MessageFlags.Ephemeral })

            if (!haspermission)
                return await this.interaction.reply({ content: "You aren't a staff to claim this ticket!", flags: MessageFlags.Ephemeral })


            if (ticketSInfo.claimed)
                return await this.interaction.reply({ content: `This ticket has already been claimed by <@${ticketSInfo.claimed}>!`, flags: MessageFlags.Ephemeral })

            await updateUTicket(this.guild.id, ticketSInfo.user_id, "claimed", this.interaction.user.id)
            return await this.interaction.reply({ content: `Ticket is claimed by ${this.interaction.user}` })
        } catch (error) {
            Print("[CLAIM] " + error, "Red");
            ErrorLog("CLAIM", error);
        }
    }

    async deleteT(reason) {
        try {
            let ticketSInfo = await getUTicketByChannel(this.interaction.guild.id, this.interaction.channel.id);

            await updateUTicket(ticketSInfo.guild_id, ticketSInfo.user_id, "reason", reason)
            setTimeout(async () => {
                try {
                    await this.transcriptT(this.interaction.user)
                    return await this.interaction.channel.delete()
                } catch (error) {
                    Print("[DELETET] " + error, "Red");
                    ErrorLog("DELETET", error);
                }
            }, 5000)
        } catch (error) {
            Print("[DELETET] " + error, "Red");
            ErrorLog("DELETET", error);
        }
    }

    async transcriptT(closed) {
        try {
            console.log(this.interaction.channel.id)
            let ticketSInfo = await getUTicketByChannel(this.interaction.guild.id, this.interaction.channel.id);
            const ticketS = await getTCol(this.guild.id);

            await updateUTicket(ticketSInfo.guild_id, ticketSInfo.user_id, "status", "closed")

            let { id_ticket, id_channel, user_id, created_at, claimed, status, guild_id, reason } = ticketSInfo

            const transcEmbed = new EmbedBuilder()
                .setTitle("Ticket Closed")
                .setFields(
                    { name: "Ticket ID", value: `${id_ticket}`, inline: true },
                    { name: "Opened By", value: `<@${user_id}>`, inline: true },
                    { name: "Closed By", value: `${closed}`, inline: true },
                    { name: "Reason", value: `${reason}` || "No reason provided", inline: true },
                    { name: "Open Time", value: `<t:${Math.floor(new Date(created_at).getTime() / 1000)}:F>`, inline: true },
                    { name: "Claimed By", value: claimed ? `<@${claimed}>` : "No one" }
                ).setTimestamp().setColor("DarkGold")

            return await this.interaction.guild.channels.cache.get(ticketS.T_transcription_id).send({ embeds: [transcEmbed] })
        } catch (error) {
            Print("[TRANSCRIPTIONT] " + error, "Red");
            ErrorLog("TRANSCRIPTIONT", error);
        }
    }
}