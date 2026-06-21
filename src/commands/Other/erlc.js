const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const axios = require("axios");

const ErlcConfig = require("../../schemas/ErlcConfig");
const { getServerData } = require("../../utils/erlc");

module.exports = {

    usableInDms: false,
    category: "Community",

    data: new SlashCommandBuilder()

        .setName("erlc")
        .setDescription("ERLC Commands")

        .addSubcommand(sub =>
            sub
                .setName("config")
                .setDescription("Configure ERLC API")
                .addStringOption(option =>
                    option
                        .setName("api_key")
                        .setDescription("Your ERLC API Key")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName("server_key")
                        .setDescription("Your ERLC Server Key")
                        .setRequired(true)
                )
        )

        .addSubcommand(sub =>
            sub
                .setName("info")
                .setDescription("View ERLC server information")
        )

        .addSubcommand(sub =>
            sub
                .setName("command")
                .setDescription("Run an ERLC command")
                .addStringOption(option =>
                    option
                        .setName("command")
                        .setDescription("Command to run")
                        .setRequired(true)
                )
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    async execute(interaction) {

        const subcommand = interaction.options.getSubcommand();

        // CONFIG
        if (subcommand === "config") {

            const apiKey = interaction.options.getString("api_key");
            const serverKey = interaction.options.getString("server_key");

            try {

                await ErlcConfig.findOneAndUpdate(
                    {
                        guildId: interaction.guild.id
                    },
                    {
                        guildId: interaction.guild.id,
                        apiKey,
                        serverKey
                    },
                    {
                        upsert: true,
                        new: true
                    }
                );

                return interaction.reply({
                    content: "✅ ERLC configuration saved successfully.",
                    ephemeral: true
                });

            } catch (err) {

                console.error(err);

                return interaction.reply({
                    content: "❌ Failed to save ERLC configuration.",
                    ephemeral: true
                });

            }

        }

        // INFO
        if (subcommand === "info") {

            await interaction.deferReply();

            try {

                const server = await getServerData(
                    interaction.guild.id
                );

                if (!server) {

                    return interaction.editReply({
                        content: "❌ ERLC has not been configured.\nUse `/erlc config` first."
                    });

                }

                const embed = new EmbedBuilder()
                    .setTitle("🚔 ERLC Server Information")
                    .addFields(
                        {
                            name: "Server Name",
                            value: server.name || "Unknown",
                            inline: true
                        },
                        {
                            name: "Server Code",
                            value: `\`${server.code}\``,
                            inline: true
                        },
                        {
                            name: "Owner",
                            value: server.owner || "Unknown",
                            inline: true
                        },
                        {
                            name: "Players",
                            value: `${server.players}/${server.maxPlayers}`,
                            inline: true
                        },
                        {
                            name: "Queue",
                            value: `${server.queue}`,
                            inline: true
                        }
                    )
                    .setFooter({
                        text: "StarLine ERLC Integration"
                    })
                    .setTimestamp();

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel("Quick Join")
                            .setStyle(ButtonStyle.Link)
                            .setURL(
                                server.joinUrl ||
                                `https://erlc.gg/join/${server.code}`
                            )
                    );

                return interaction.editReply({
                    embeds: [embed],
                    components: [row]
                });

            } catch (err) {

                console.error(err);

                return interaction.editReply({
                    content: "❌ Failed to fetch ERLC server information."
                });

            }

        }

        // COMMAND
        if (subcommand === "command") {

            const commandText =
                interaction.options.getString("command");

            const config = await ErlcConfig.findOne({
                guildId: interaction.guild.id
            });

            if (!config) {

                return interaction.reply({
                    content: "❌ ERLC has not been configured. Use `/erlc config` first.",
                    ephemeral: true
                });

            }

            try {

                await axios.post(
                    "https://api.erlc.gg/v2/server/command",
                    {
                        command: commandText
                    },
                    {
                        headers: {
                            "server-key": config.serverKey
                        }
                    }
                );

                return interaction.reply({
                    content: `✅ Successfully ran:\n\`${commandText}\``,
                    ephemeral: true
                });

            } catch (err) {

                console.error(
                    err.response?.data || err.message
                );

                return interaction.reply({
                    content: "❌ Failed to run the ERLC command.",
                    ephemeral: true
                });

            }

        }

    }

};
