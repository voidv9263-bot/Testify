const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionsBitField,
    MessageFlags,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

// Allowed owners
const OWNER_IDS = [
    "1340732093004648680", // Replace with first ID
    "961048718612774922", // Replace with second ID
    "1106309950457778207"  // Replace with third ID
];

module.exports = {
    usableInDms: false,
    category: "Owner",
    permissions: [PermissionsBitField.Administrator],

    data: new SlashCommandBuilder()
        .setName("guild-list")
        .setDescription("Lists all guilds the bot is in (OWNER ONLY COMMAND).")
        .setDefaultMemberPermissions(PermissionsBitField.Administrator),

    async execute(interaction, client) {

        try {

            // Owner check
            if (!OWNER_IDS.includes(interaction.user.id)) {
                return await interaction.reply({
                    content: `${client.config.ownerOnlyCommand}`,
                    flags: MessageFlags.Ephemeral,
                });
            }

            const guilds = client.guilds.cache;
            const pageSize = 5;
            const pages = Math.ceil(guilds.size / pageSize);
            let page = 1;

            const generateGuildList = async (pageNum) => {

                const start = (pageNum - 1) * pageSize;
                const end = pageNum * pageSize;

                let guildList = "";
                let index = 1;

                for (const [guildId, guild] of guilds) {

                    try {

                        const owner = await guild.fetchOwner().catch(() => null);

                        if (index > end) break;

                        if (index > start) {

                            guildList += `**Guild**: ${guild.name} (${guildId})\n`;
                            guildList += `**Members**: ${guild.memberCount}\n`;

                            if (owner) {
                                guildList += `**Owner**: ${owner.user.tag} (${owner.user.id})\n`;
                            } else {
                                guildList += `**Owner**: Could not fetch owner\n`;
                            }

                            const bot = guild.members.cache.get(client.user.id);

                            if (
                                bot &&
                                bot.permissions.has(
                                    PermissionsBitField.Flags.CreateInstantInvite
                                )
                            ) {

                                const inviteChannel = guild.channels.cache.find(
                                    c =>
                                        c.type === 0 &&
                                        c.permissionsFor(bot).has(
                                            PermissionsBitField.Flags.CreateInstantInvite
                                        )
                                );

                                if (inviteChannel) {

                                    try {

                                        const invite =
                                            await inviteChannel.createInvite({
                                                maxAge: 86400,
                                                maxUses: 1,
                                            });

                                        guildList += `**Invite**: ${invite.url}\n\n`;

                                    } catch {

                                        guildList +=
                                            "**Invite**: Failed to create invite\n\n";
                                    }

                                } else {

                                    guildList +=
                                        "**Invite**: No suitable channel found\n\n";
                                }

                            } else {

                                guildList +=
                                    "**Invite**: Missing permissions\n\n";
                            }
                        }

                        index++;

                    } catch (err) {

                        console.error(
                            `Error processing guild ${guildId}:`,
                            err
                        );
                    }
                }

                return guildList || "No guilds to display on this page.";
            };

            const guildList = await generateGuildList(page);

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: `Guild List Command ${client.config.devBy}`
                })
                .setTitle(
                    `${client.user.username} Guild List Tool ${client.config.arrowEmoji}`
                )
                .setDescription(guildList)
                .setColor(client.config.embedDev)
                .setFooter({
                    text: `Page ${page}/${pages} • Total Guilds: ${guilds.size}`
                })
                .setThumbnail(client.user.displayAvatarURL())
                .setTimestamp();

            const buttons = new ActionRowBuilder().addComponents(

                new ButtonBuilder()
                    .setCustomId(`guildlist-first-${interaction.user.id}`)
                    .setEmoji("⏮️")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 1),

                new ButtonBuilder()
                    .setCustomId(`guildlist-prev-${interaction.user.id}`)
                    .setEmoji("◀️")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 1),

                new ButtonBuilder()
                    .setCustomId(`guildlist-refresh-${interaction.user.id}`)
                    .setEmoji("🔄")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId(`guildlist-next-${interaction.user.id}`)
                    .setEmoji("▶️")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === pages),

                new ButtonBuilder()
                    .setCustomId(`guildlist-last-${interaction.user.id}`)
                    .setEmoji("⏭️")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === pages)
            );

            await interaction.reply({
                embeds: [embed],
                components: pages > 1 ? [buttons] : []
            });

        } catch (error) {

            console.error("Guild list command error:", error);

            return interaction.reply({
                content: "❌ An error occurred while listing guilds.",
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
