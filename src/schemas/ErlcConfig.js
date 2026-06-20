const mongoose = require("mongoose");

const erlcConfigSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },

    apiKey: {
        type: String,
        required: true
    },

    serverKey: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("ErlcConfig", erlcConfigSchema);
