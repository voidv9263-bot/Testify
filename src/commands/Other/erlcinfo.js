const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const {
    getServerData
} = require("../../utils/erlc");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("erlc_info")
        .setDescription("View ERLC server info"),

    async execute(interaction) {

        const server =
            await getServerData(
                interaction.guild.id
            );

        if (!server) {

            return interaction.reply({
                content:
                    "❌ ERLC has not been configured for this server run /erlc config.",
                ephemeral: true
            });

        }

        const embed =
            new EmbedBuilder()
            .setTitle("🚔 ERLC Server Information")

            .addFields(
                {
                    name: "Server Name",
                    value: server.name,
                    inline: true
                },
                {
                    name: "Server Code",
                    value: `\`${server.code}\``,
                    inline: true
                },
                {
                    name: "Owner",
                    value: server.owner,
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

            .setTimestamp();

        const row =
            new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()

                .setLabel(
                    "Quick Join"
                )

                .setStyle(
                    ButtonStyle.Link
                )

                .setURL(
                    server.joinUrl
                )
            );

        await interaction.reply({

            embeds: [embed],

            components: [row]

        });

    }

};
