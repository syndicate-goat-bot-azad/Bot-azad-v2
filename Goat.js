/**

Goat Bot V2 — Main File with Stable Login

Ei file diye bot directly run hobe, bar bar logout hobe na.

Author: Azad

File: Goat.js */


const { startStableLogin } = require("./login/stable-login");

// Bot start startStableLogin({ onReady: (api) => { console.log("[Goat Bot V2] Bot Ready! Logged in successfully.");

// Listener start
api.listenMqtt((err, event) => {
  if (err) {
    console.error("[Goat Bot V2] Listen Error:", err);
    return;
  }

  // Basic message handler
  if (event.type === "message") {
    const msg = event.body?.toLowerCase() || "";

    if (msg === "ping") {
      api.sendMessage("Pong! 🐐", event.threadID);
    }
    else if (msg === "owner") {
      api.sendMessage("Bot owner: Azad", event.threadID);
    }
    else if (msg === "help") {
      api.sendMessage("Available commands: ping, owner, help", event.threadID);
    }
  }
});

},

onEvent: (api, ev) => { // Optional: capture other events here if (ev.logMessageType) { console.log("[Event]", ev.logMessageType); } } });
