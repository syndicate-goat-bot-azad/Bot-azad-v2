/**
 * Goat Bot V2 — Main File with Stable Login
 * Ei file diye bot directly run hobe, bar bar logout hobe na.
 * Author: Azad
 * File: Goat.js
 */

const { startStableLogin } = require("./login/stable-login");

async function initBot() {
  try {
    await startStableLogin({
      onReady: (api) => {
        console.log("[Goat Bot V2] Bot Ready! Logged in successfully.");

        // Listener start
        api.listenMqtt((err, event) => {
          if (err) {
            console.error("[Goat Bot V2] Listen Error:", err);
            return;
          }

          // Basic message handler
          if (event.type === "message") {
            const msg = event.body?.toLowerCase() || "";

            switch (msg) {
              case "ping":
                api.sendMessage("Pong! 🐐", event.threadID);
                break;
              case "owner":
                api.sendMessage("Bot owner: Azad", event.threadID);
                break;
              case "help":
                api.sendMessage("Available commands: ping, owner, help", event.threadID);
                break;
            }
          }
        });
      },

      onEvent: (api, ev) => {
        // Optional: capture other events
        if (ev.logMessageType) {
          console.log("[Event]", ev.logMessageType);
        }
      },
    });
  } catch (error) {
    console.error("[Goat Bot V2] Failed to start:", error);
  }
}

// Start the bot
initBot();
