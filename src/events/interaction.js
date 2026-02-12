import { MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, TimestampStyles, time, ModalBuilder, LabelBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { Print } from "../handler/extraHandler.js";
import { TicketSystem } from "../systems/TicketSystem.js";
import { ErrorLog } from "../systems/LogSystem.js";
import ServerDB from "../data/ServerDB.js";
import { updateUTicket } from "../data/TicketDB.js";

export default {
    name: "interactionCreate",

    /**
    * @param {import("discord.js").Interaction} interaction;
    * @param {import("discord.js").Client} client;
    */
    async eventrun(client, interaction) {
        try {
            if (interaction.isChatInputCommand()) {
                const { commandName } = interaction;

                const command = client.commands.get(commandName);

                let server = new ServerDB(interaction.guildId)

                //Cooldown
                if (command.cooldown) {
                    let cooldownUntil = client.cooldowns.get(`${command.name}-${interaction.user.id}`);
                    if (cooldownUntil && cooldownUntil > Date.now()) {
                        cooldownUntil = Math.floor(cooldownUntil / 1000)

                        const errbed = new EmbedBuilder().setDescription(`Command is on cooldown for ${time(cooldownUntil, TimestampStyles.RelativeTime)}}`).setColor("Red")
                        return await interaction.reply({ embeds: [errbed], flags: MessageFlags.Ephemeral })
                    }

                    client.cooldowns.set(`${command.name}-${interaction.user.id}`, new Date().valueOf() + command.cooldown);
                }

                //Owner
                if (command.owner)
                    if (interaction.user.id !== process.env.ownerid)
                        return;

                //Admin
                if (command.admin)
                    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                        const permbed = new EmbedBuilder()
                            .setDescription("```You are not an admin to use this command!```").setColor("Red");
                        return interaction.reply({ embeds: [permbed], flags: MessageFlags.Ephemeral });
                    }

                //Staff
                if (command.staff) {
                    let staffID = await server.getStaffR()
                    const hasPermission =
                        interaction.member.permissions.has(PermissionFlagsBits.Administrator) ||
                        interaction.member.permissions.has(PermissionFlagsBits.ManageMessages) ||
                        (staffID && interaction.member.roles.cache.has(staffID))

                    if (!hasPermission) {
                        const permbed = new EmbedBuilder()
                            .setDescription("```You are not a staff to use this command!```").setColor("Red");
                        return interaction.reply({ embeds: [permbed], flags: MessageFlags.Ephemeral });
                    }
                }

                command.execute(interaction, client);
            }

            if (interaction.isButton()) {

                //Open T btn
                if (interaction.customId === `ticket-${interaction.guild.id}-${interaction.channel.id}`) {
                    const TicketC = new TicketSystem(interaction, client);
                    await TicketC.openT();
                }

                if (interaction.customId === `claimT-${interaction.channel.id}-${interaction.member.user.id}`) {
                    await new TicketSystem(interaction, client).claimT()
                }

                if (interaction.customId === `closeT-${interaction.channel.id}-${interaction.member.user.id}`) {
                    await new TicketSystem(interaction, client).closeT()
                    await interaction.message.edit({ components: [] })

                    const close = new ButtonBuilder()
                        .setLabel("Delete")
                        .setCustomId(`deleteT-${interaction.channel.id}-${interaction.member.user.id}`)
                        .setStyle(ButtonStyle.Danger)

                    const cancel = new ButtonBuilder()
                        .setLabel("Reopen")
                        .setCustomId(`reopenT-${interaction.channel.id}-${interaction.member.user.id}`)
                        .setStyle(ButtonStyle.Secondary)

                    await interaction.message.reply({
                        embeds: [new EmbedBuilder().setDescription("Want to delete this ticket or reopen it?")],
                        components: [new ActionRowBuilder().setComponents(close, cancel)]
                    })
                }

                if (interaction.customId === `reopenT-${interaction.channel.id}-${interaction.member.user.id}`) {
                    await new TicketSystem(interaction, client).reopenT()
                    const messageold = interaction.channel.messages.fetch(interaction.message.reference.messageId)

                    const closeBtn = new ButtonBuilder()
                        .setCustomId(`closeT-${interaction.channel.id}-${interaction.member.user.id}`)
                        .setEmoji("🔒")
                        .setLabel("Close")
                        .setStyle(ButtonStyle.Danger);

                    const claimBtn = new ButtonBuilder()
                        .setCustomId(`claimT-${interaction.channel.id}-${interaction.member.user.id}`)
                        .setEmoji("📫")
                        .setLabel("Claim")
                        .setStyle(ButtonStyle.Primary);

                    (await messageold).edit({ components: [new ActionRowBuilder().setComponents(closeBtn, claimBtn)] })
                    await interaction.message.delete()
                    return await interaction.reply({ content: "Reopened the ticket!", flags: MessageFlags.Ephemeral })
                }

                if (interaction.customId === `deleteT-${interaction.channel.id}-${interaction.member.user.id}`) {
                    const modal = new ModalBuilder()
                        .setCustomId(`closing-${interaction.channel.id}-${interaction.member.user.id}`)
                        .setTitle("Ticket Deletion Reason")
                        .addLabelComponents(new LabelBuilder()
                            .setLabel("Provide the reason of ticket deletion.")
                            .setTextInputComponent(new TextInputBuilder()
                                .setCustomId("reason")
                                .setStyle(TextInputStyle.Paragraph)
                            )
                        )

                    await interaction.showModal(modal)
                }

            }

            if (interaction.isModalSubmit()) {
                if (interaction.customId === `closing-${interaction.channel.id}-${interaction.member.user.id}`) {
                    await interaction.message.edit({ components: [] })
                    const reason = interaction.fields.getTextInputValue("reason")

                    await interaction.reply("Closing ticket...")
                    await new TicketSystem(interaction, client).deleteT(reason)
                }
            }

            if (interaction.isStringSelectMenu()) {

                if (interaction.customId === `help-select-${interaction.guild.id}-${interaction.channel.id}`) {
                    const sections = interaction.values.toString()

                        await (await interaction.reply({ content: `You have chose ${sections}`, flags: MessageFlags.Ephemeral})).delete()

                    switch (sections) {
                        case "economy":
                            await interaction.message.edit({ embeds: [new EmbedBuilder().setTitle("Economy").setColor("DarkGold").setDescription("This is a business class section.\n\nYou can earn sparks (currency) through using:\n> `!earns` : 5mins cooldown\n> `!dailys` : 24hrs cooldown\n> `!coinflip [amount]` : 10mins cooldown (amount should be between 50 and 2000)\n\nTo check on your balance you may use:\n> `!bal`").setFooter({ text: "Made by real_ranox | - More commands coming soon." })]})
                            break;
                        case "minigames":
                            await interaction.message.edit({ embeds: [new EmbedBuilder().setTitle("Mini Games").setColor("Blurple").setDescription("Welcome to mini-games section! There are two current games\n**RGL (Red Green Ligth)** AND **GTN (Guess the number)**\n\n**RGL Commands (staff):**\n> `!rgl s/start <rounds> <maxtimer> <winners amount>`\n> `!rgl end/stop` In case you wanna stop a game.").setFooter({ text: "Made by real_ranox | - More commands coming soon." })]})
                            break;
                        case "tickets":
                            await interaction.message.edit({ embeds: [new EmbedBuilder().setTitle("Tickets").setColor("DarkGreen").setDescription("Welcome to tickets section! Admins only command.\nUse /ticket for setup!").setFooter({ text: "Made by real_ranox | - More commands coming soon." })]})
                            break;
                        case "moderation":
                            await interaction.message.edit({ embeds: [new EmbedBuilder().setTitle("Moderation").setColor("Fuchsia").setDescription("Underdevelopment thanks for patience.").setFooter({ text: "Made by real_ranox | - More commands coming soon." })]})
                            break;
                        default:
                            await interaction.reply({ content: "Something went wrong. Please report this issue if repeated.", flags: MessageFlags.Ephemeral})
                            break;
                    }
                }
            }

        } catch (error) {
            Print("[ERROR] " + error, "Red");
            ErrorLog("Interaction", error);
        }
    }
}