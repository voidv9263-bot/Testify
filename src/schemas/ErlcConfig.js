const mongoose = require("mongoose");

module.exports = mongoose.model(
    "ErlcConfig",

    new mongoose.Schema({

        guildId: {
            type: String,
            unique: true
        },

        apiKey: String,

        serverKey: String,

        joinLogs: String,

        leaveLogs: String,

        commandLogs: String,

        killLogs: String

    })
);
