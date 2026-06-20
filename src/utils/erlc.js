const axios = require("axios");
const ErlcConfig = require("../schemas/ErlcConfig");

const API_BASE = "https://api.erlc.gg/v2/server";

async function getServerData(guildId) {

    const config = await ErlcConfig.findOne({
        guildId
    });

    if (!config) return null;

    try {

        const res = await axios.get(
            API_BASE,
            {
                headers: {
                    "server-key": config.apiKey
                },

                params: {

                    // SERVER DATA
                    Players: true,
                    Queue: true,
                    Staff: true,

                    // LOGS
                    JoinLogs: true,
                    KillLogs: true,
                    CommandLogs: true

                }
            }
        );

        const data = res.data;

        return {

            // Full API response
            raw: data,

            // Server Info
            name:
                data.Name ||
                "Unknown Server",

            code:
                data.JoinKey ||
                data.ServerCode ||
                "Unknown",

            ownerId:
                data.OwnerId ||
                data.Owner?.UserId ||
                data.Owner?.Id ||
                null,

            owner:
                data.Owner?.Username ||
                data.Owner?.Name ||
                data.Owner ||
                "Unknown",

            // Players
            players:
                data.CurrentPlayers ??
                data.Players?.length ??
                0,

            maxPlayers:
                data.MaxPlayers ??
                0,

            queue:
                data.Queue?.length ??
                0,

            playersArray:
                Array.isArray(data.Players)
                    ? data.Players
                    : [],

            queueArray:
                Array.isArray(data.Queue)
                    ? data.Queue
                    : [],

            // Logs
            joinLogs:
                Array.isArray(data.JoinLogs)
                    ? data.JoinLogs
                    : [],

            killLogs:
                Array.isArray(data.KillLogs)
                    ? data.KillLogs
                    : [],

            commandLogs:
                Array.isArray(data.CommandLogs)
                    ? data.CommandLogs
                    : [],

            // Quick Join
            joinUrl:

                data.JoinKey

                    ? `https://erlc.gg/join/${data.JoinKey}`

                    : `https://erlc.gg/join/${data.ServerCode}`

        };

    }

    catch (err) {

        console.error(
            "❌ ERLC API Error:",
            err.response?.data ||
            err.message
        );

        return null;

    }

}

module.exports = {
    getServerData
};
