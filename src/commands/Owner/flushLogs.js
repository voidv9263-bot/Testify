const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    MessageFlags
} = require("discord.js");

const { flushLogs } = require("../../scripts/consoleLogger");
const { color, getTimestamp } = require("../../utils/loggingEffects");

// Allowed owners
const OWNER_IDS = [
    "1340732093004648680", // Replace with first ID
    "961048718612774922", // Replace with second ID
    "1106309950457778207"  // Replace with third ID
];

module.exports = {
    usableInDms: true,
    category: "Owner",
    permissions: [PermissionFlagsBits.Administrator],

    data: new SlashCommandBuilder()
        .setName("flush-logs")
        .setDescription("Manually flush logs to Discord webhook (Owner Only)")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {

        try {

            // Owner check
            if (!OWNER_IDS.includes(interaction.user.id)) {
                return await interaction.reply({
                    content: `${client.config.ownerOnlyCommand}`,
                    flags: MessageFlags.Ephemeral,
                });
            }

            await interaction.deferReply({
                flags: MessageFlags.Ephemeral
            });

            console.log(
                `${color.blue}[${getTimestamp()}] [LOGS] Manually flushing logs to Discord${color.reset}`
            );

            flushLogs(true);

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: `Flush Logs Command ${client.config.devBy}`
                })
                .setTitle(
                    `${client.user.username} Flush Logs ${client.config.arrowEmoji}`
                )
                .setColor(client.config.embedDev)
                .setDescription(
                    `${client.config.countSuccessEmoji} Logs have been successfully sent to the Discord webhook.`
                )
                .setTimestamp()
                .setFooter({
                    text: `${client.user.username} | ${client.config.botVersion}`
                });

            await interaction.editReply({
                embeds: [embed]
            });

        } catch (error) {

            console.error(
                `${color.red}[${getTimestamp()}] [LOGS] Error flushing logs: ${error}${color.reset}`
            );

            if (interaction.deferred) {

                await interaction.editReply({
                    content: `${client.config.errorEmoji} Failed to send logs: ${error.message}`
                });

            } else {

                await interaction.reply({
                    content: `${client.config.errorEmoji} Failed to send logs: ${error.message}`,
                    flags: MessageFlags.Ephemeral
                });

            }
        }
    }
};
