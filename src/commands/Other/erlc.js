const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const ErlcConfig = require("../models/ErlcConfig");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("erlc")
        .setDescription("ERLC commands")

        .addSubcommand(sub =>
            sub
                .setName("config")
                .setDescription("Configure ERLC API")
                .addStringOption(opt =>
                    opt
                        .setName("api_key")
                        .setDescription("Your ERLC API key")
                        .setRequired(true)
                )
                .addStringOption(opt =>
                    opt
                        .setName("server_key")
                        .setDescription("Your ERLC Server Key")
                        .setRequired(true)
                )
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    async execute(interaction) {

        if (interaction.options.getSubcommand() === "config") {

            const apiKey = interaction.options.getString("api_key");
            const serverKey = interaction.options.getString("server_key");

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
                content: "ERLC configuration saved successfully.",
                ephemeral: true
            });
        }
    }
};
