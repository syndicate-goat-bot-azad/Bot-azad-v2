// Author: Azad

require("dotenv").config(); // Load .env variables

// =================== Global Configs ===================
try {
    global.GoatBot = require("./config/globalConfig");
    global.utils = require("./utils/index");
    global.db = require("./database/models");
} catch (err) {
    console.error("❌ Config load error:", err.message);
    process.exit(1);
}

// =================== Server & App ===================
let app, server;
try {
    const serverConfig = require("./config/server");
    app = serverConfig.app;
    server = serverConfig.server;
} catch (err) {
    console.error("❌ Server config error:", err.message);
    process.exit(1);
}

// =================== PORT CONFIG ===================
const { config, utils } = global.GoatBot;
const PORT = process.env.PORT || config.dashBoard?.port || config.serverUptime?.port || 3000;

// Dashboard URL detect
let dashBoardUrl;
if (process.env.REPL_OWNER) {
    dashBoardUrl = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
} else if (process.env.API_SERVER_EXTERNAL === "https://api.glitch.com") {
    dashBoardUrl = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
} else {
    dashBoardUrl = `http://localhost:${PORT}`;
}

// =================== Error Handler ===================
app.use((err, req, res, next) => {
    console.error("❌ Unhandled error:", err);
    res.status(500).json({ error: "Internal Server Error" });
});

// =================== Start Server ===================
server.listen(PORT, "0.0.0.0", () => {
    utils.log?.info("DASHBOARD", `Dashboard is running: ${dashBoardUrl}`);

    if (config.serverUptime?.socket?.enable === true) {
        try {
            require("../bot/login/socketIO")(server);
        } catch (err) {
            console.error("❌ Socket.IO error:", err.message);
        }
    }
});

// =================== Keep Alive System ===================
const fetch = require("node-fetch");
setInterval(() => {
    fetch(dashBoardUrl)
        .then(() => console.log("🔄 Keep-alive ping sent"))
        .catch(() => {});
}, 5 * 60 * 1000); // প্রতি ৫ মিনিটে পিং পাঠাবে
