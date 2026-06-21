const {
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    MessageFlags,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

// Put your 3 owner IDs here
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
        .setName("eval")
        .setDescription("Evaluates JavaScript code.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {

        // Unauthorized user
        if (!OWNER_IDS.includes(interaction.user.id)) {

            await interaction.reply({
                content: `${client.config.ownerOnlyCommand}`,
                flags: MessageFlags.Ephemeral
            });

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: `${interaction.user.tag} has tried to run the eval command`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
                .setTitle(`Unauthorized Access Attempt Detected ${client.config.arrowEmoji}`)
                .setDescription(
                    `${interaction.user.tag} has tried to run the eval command but is not a developer.\n\n` +
                    `If this persists, consider **revoking their access** to ${client.user.username} with \`/blacklist add\`.`
                )
                .addFields({
                    name: "User ID",
                    value: interaction.user.id,
                    inline: true
                })
                .setColor(client.config.embedDev)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setFooter({
                    text: `Eval warning embed ${client.config.devBy}`,
                    iconURL: client.user.displayAvatarURL()
                })
                .setTimestamp();

            // Send embed to all owners
            for (const ownerId of OWNER_IDS) {
                try {

                    const owner = await client.users.fetch(ownerId);

                    await owner.send({
                        embeds: [embed]
                    });

                } catch (err) {
                    console.log(
                        `[EVAL WARNING] Failed to send DM to ${ownerId}:`,
                        err
                    );
                }
            }

            return;
        }

        // Authorized user
        const modal = new ModalBuilder()
            .setCustomId("evalModal")
            .setTitle("Evaluate JavaScript Code");

        const codeInput = new TextInputBuilder()
            .setCustomId("codeInput")
            .setLabel("Code to evaluate")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const ephemeralInput = new TextInputBuilder()
            .setCustomId("ephemeralInput")
            .setLabel("Ephemeral (true/false)")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const row1 = new ActionRowBuilder().addComponents(codeInput);
        const row2 = new ActionRowBuilder().addComponents(ephemeralInput);

        modal.addComponents(row1, row2);

        await interaction.showModal(modal);
    },
};
