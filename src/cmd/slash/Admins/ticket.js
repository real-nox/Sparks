const { SlashCommandBuilder, ChannelType } = require("discord.js");
const { TicketSystem } = require("../../../classes/TicketSystem");
const { Print } = require("../../../handler/extraHandler");
const { ErrorLog } = require("../../../handler/logsHanlder");

module.exports = {
    cooldown: 10000,
    data: new SlashCommandBuilder()
        .setName("ticket")
        .setDescription("Command to create/edit/close tickets")
        .addSubcommand(sub1 =>
            sub1
                .setName("create")
                .setDescription("Setup your ticket system.")
                .addStringOption(sub1S =>
                    sub1S
                        .setName("title")
                        .setDescription("Put your text's title that will show up in your main ticket text.")
                        .setMinLength(5)
                        .setMaxLength(50)
                        .setRequired(true)
                )
                .addStringOption(sub1S =>
                    sub1S
                        .setName("description")
                        .setDescription("Put your text that will show up in your main ticket text. Check `!text` to format your text.")
                        .setMinLength(5)
                        .setMaxLength(300)
                        .setRequired(true)
                )
                .addChannelOption(sub1C =>
                    sub1C.setName("channel")
                        .setDescription("Select the channel where your ticket will appear in.")
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
                .addChannelOption(sub1C =>
                    sub1C.setName("category")
                        .setDescription("Select the category where tickets will be created in.")
                        .addChannelTypes(ChannelType.GuildCategory)
                        .setRequired(false)
                )
                .addChannelOption(sub1C =>
                    sub1C.setName("transcription")
                        .setDescription("Select the channel for your ticket's transcriptions.")
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false)
                )
                .addStringOption(sub1S =>
                    sub1S.setName("button-title")
                        .setDescription("Select the category where tickets will be created in.")
                        .setMinLength(5)
                        .setMaxLength(50)
                        .setRequired(false)
                )
                .addStringOption(sub1S =>
                    sub1S.setName("button-color")
                        .setDescription("Select the category where tickets will be created in.")
                        .setChoices(
                            {
                                name: "Red",
                                value: "Danger"
                            },
                            {
                                name: "Green",
                                value: "Success"
                            },
                            {
                                name: "Blue",
                                value: "Primary"
                            },
                            {
                                name: "Grey",
                                value: "Secondary"
                            }
                        ).setRequired(false)
                )
                .addRoleOption(sub1R =>
                    sub1R
                        .setName("staff")
                        .setDescription("Select your ticket staff.")
                        .setRequired(false)
                )
        ),
    async execute(interaction, client) {
        try {
            const type = interaction.options.getSubcommand();

            switch (type) {
                case 'create':
                    const ticketConfig = {
                        title: interaction.options.getString("title"),
                        text: interaction.options.getString("description"),
                        channel: interaction.options.getChannel("channel"),
                        category: interaction.options.getChannel("category"),
                        transcription: interaction.options.getChannel("transcription"),
                        btitle: interaction.options.getString("button-title"),
                        bcolor: interaction.options.getString("button-color"),
                        staff: interaction.options.getRole("staff")
                    }

                    let ticket = new TicketSystem(interaction, client)
                    await ticket.createT(ticketConfig)
                    break;

                default:
                    break;
            }

        } catch (error) {
            Print("[TICKET] " + error, "Red");
            ErrorLog("TICKETCMD", error);
        }
    }
}