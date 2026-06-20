const axios = require("axios");
const ErlcConfig = require("../models/ErlcConfig");

const API_BASE = "https://api.erlc.gg/v2/server";

async function getServerData(guildId) {

    const config = await ErlcConfig.findOne({
        guildId
    });

    if (!config) {
        return null;
    }

    try {

        const res = await axios.get(
            API_BASE,
            {
                headers: {
                    "server-key": config.apiKey
                },
                params: {
                    Players: true,
                    Queue: true,
                    Staff: true
                }
            }
        );

        const data = res.data;

        return {

            raw: data,

            name:
                data.Name ||
                "Unknown Server",

            code:
                data.JoinKey ||
                data.ServerCode ||
                "Unknown",

            ownerId:
                data.OwnerId ||
                null,

            owner:
                data.Owner ||
                "Unknown",

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

            joinUrl:
                `https://erlc.gg/join/${data.JoinKey}`

        };

    } catch (err) {

        console.error(
            "ERLC API Error:",
            err.response?.data ||
            err.message
        );

        return null;
    }
}

module.exports = {
    getServerData
};
