import { MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, TimestampStyles } from "discord.js";
import { Print } from "../handler/extraHandler.js";
import { TicketSystem } from "../systems/TicketSystem.js";
import { ErrorLog } from "../systems/LogSystem.js";
import ServerDB from "../data/ServerDB.js";

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

                if (interaction.customId === `closeT-${interaction.channel.id}-${interaction.member.user.id}`) {
                    await interaction.message.edit({ components: [] })

                    const close = new ButtonBuilder()
                        .setLabel("Close")
                        .setCustomId(`Tclose-${interaction.channel.id}-${interaction.member.user.id}`)
                        .setStyle(ButtonStyle.Danger)

                    const cancel = new ButtonBuilder()
                        .setLabel("Cancel")
                        .setCustomId(`cancelT-${interaction.channel.id}-${interaction.member.user.id}`)
                        .setStyle(ButtonStyle.Secondary)

                    await interaction.message.reply({
                        embeds: [new EmbedBuilder().setDescription("Are you sure you want to close this ticket?")],
                        components: [new ActionRowBuilder().setComponents(close, cancel)]
                    })
                }

                if (interaction.customId === `cancelT-${interaction.channel.id}-${interaction.member.user.id}`) {
                    console.log(interaction.message)
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
                }

                if (interaction.customId === `claimT-${interaction.channel.id}-${interaction.member.user.id}`) {
                    await new TicketSystem(interaction, client).claimT()
                }

                if (interaction.customId === `Tclose-${interaction.channel.id}-${interaction.member.user.id}`) {

                }

            }
        } catch (error) {
            Print("[ERROR] " + error, "Red");
            ErrorLog("Interaction", error);
        }
    }
}