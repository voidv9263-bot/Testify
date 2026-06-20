const {
    Events,
    EmbedBuilder
} = require("discord.js");

const ErlcConfig = require(".../../schemas/ErlcConfig");
const { getServerData } = require("../../utils/erlc");

const cache = {

    joins: new Set(),

    leaves: new Set(),

    kills: new Set(),

    commands: new Set()

};

module.exports = {

    name: Events.ClientReady,

    once: true,

    async execute(client) {

        console.log("ERLC Logs Started");

        setInterval(async () => {

            const guilds =
                await ErlcConfig.find();

            for (const config of guilds) {

                try {

                    const data =
                        await getServerData(
                            config.guildId
                        );

                    if (!data) continue;

                    // JOIN LOGS

                    if (
                        config.joinLogs &&
                        Array.isArray(
                            data.raw.JoinLogs
                        )
                    ) {

                        const channel =
                            client.channels.cache.get(
                                config.joinLogs
                            );

                        if (channel) {

                            for (const log of data.raw.JoinLogs) {

                                const id =
                                    `${log.Player}-${log.Timestamp}`;

                                if (
                                    cache.joins.has(id)
                                )
                                    continue;

                                cache.joins.add(id);

                                if (
                                    log.Join === true
                                ) {

                                    const embed =
                                        new EmbedBuilder()

                                        .setTitle(
                                            "Player Joined"
                                        )

                                        .setDescription(
                                            `**${log.Player}** joined the server.`
                                        )

                                        .setTimestamp(
                                            log.Timestamp * 1000
                                        );

                                    channel.send({

                                        embeds: [embed]

                                    });

                                }

                                else {

                                    const embed =
                                        new EmbedBuilder()

                                        .setTitle(
                                            "Player Left"
                                        )

                                        .setDescription(
                                            `**${log.Player}** left the server.`
                                        )

                                        .setTimestamp(
                                            log.Timestamp * 1000
                                        );

                                    channel.send({

                                        embeds: [embed]

                                    });

                                }

                            }

                        }

                    }

                    // KILL LOGS

                    if (

                        config.killLogs &&

                        Array.isArray(
                            data.raw.KillLogs
                        )

                    ) {

                        const channel =
                            client.channels.cache.get(
                                config.killLogs
                            );

                        if (channel) {

                            for (const log of data.raw.KillLogs) {

                                const id =
                                    `${log.Killer}-${log.Killed}-${log.Timestamp}`;

                                if (
                                    cache.kills.has(id)
                                )
                                    continue;

                                cache.kills.add(id);

                                const embed =
                                    new EmbedBuilder()

                                    .setTitle(
                                        "Kill Logged"
                                    )

                                    .addFields(

                                        {

                                            name:
                                                "Killer",

                                            value:
                                                log.Killer,

                                            inline: true

                                        },

                                        {

                                            name:
                                                "Killed",

                                            value:
                                                log.Killed,

                                            inline: true

                                        }

                                    )

                                    .setTimestamp(
                                        log.Timestamp * 1000
                                    );

                                channel.send({

                                    embeds: [embed]

                                });

                            }

                        }

                    }

                    // COMMAND LOGS

                    if (

                        config.commandLogs &&

                        Array.isArray(
                            data.raw.CommandLogs
                        )

                    ) {

                        const channel =
                            client.channels.cache.get(
                                config.commandLogs
                            );

                        if (channel) {

                            for (const log of data.raw.CommandLogs) {

                                const id =
                                    `${log.Player}-${log.Command}-${log.Timestamp}`;

                                if (
                                    cache.commands.has(id)
                                )
                                    continue;

                                cache.commands.add(id);

                                const embed =
                                    new EmbedBuilder()

                                    .setTitle(
                                        "Command Executed"
                                    )

                                    .addFields(

                                        {

                                            name:
                                                "Player",

                                            value:
                                                log.Player,

                                            inline: true

                                        },

                                        {

                                            name:
                                                "Command",

                                            value:
                                                `\`${log.Command}\``,

                                            inline: true

                                        }

                                    )

                                    .setTimestamp(
                                        log.Timestamp * 1000
                                    );

                                channel.send({

                                    embeds: [embed]

                                });

                            }

                        }

                    }

                }

                catch (err) {

                    console.error(

                        "ERLC Logs Error:",

                        err

                    );

                }

            }

        }, 10000);

    }

};
