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

// =================== PORT & URL CONFIG ===================
const { config, utils } = global.GoatBot;
const PORT = config.dashBoard?.port || config.serverUptime?.port || process.env.PORT || 3001;

let dashBoardUrl = `https://${process.env.REPL_OWNER
    ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
    : process.env.API_SERVER_EXTERNAL === "https://api.glitch.com"
        ? `${process.env.PROJECT_DOMAIN}.glitch.me`
        : `localhost:${PORT}`}`;

if (dashBoardUrl.includes("localhost")) {
    dashBoardUrl = dashBoardUrl.replace("https", "http");
}

// =================== Error Handler Middleware ===================
app.use((err, req, res, next) => {
    console.error("❌ Unhandled error:", err);
    res.status(500).json({ error: "Internal Server Error" });
});

// =================== Start Server ===================
server.listen(PORT, () => {
    utils.log?.info("DASHBOARD", `Dashboard is running: ${dashBoardUrl}`);

    // Socket.IO init if enabled
    if (config.serverUptime?.socket?.enable === true) {
        try {
            require("../bot/login/socketIO")(server);
        } catch (err) {
            console.error("❌ Socket.IO error:", err.message);
        }
    }
});
