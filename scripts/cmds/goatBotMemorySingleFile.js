// Author: Azad
// File: goatBotMemorySingleFile.js

const fs = require("fs");
const path = require("path");

// ===== Memory Setup =====
const memoryFilePath = path.join(__dirname, "memory.json");

// Memory file exist na thakle create koro
if (!fs.existsSync(memoryFilePath)) {
    fs.writeFileSync(memoryFilePath, JSON.stringify({}), "utf-8");
}

// Memory load/save
function loadMemory() {
    const data = fs.readFileSync(memoryFilePath, "utf-8");
    return JSON.parse(data);
}

function saveMemory(memory) {
    fs.writeFileSync(memoryFilePath, JSON.stringify(memory, null, 2), "utf-8");
}

// ===== Memory Functions =====
function saveUserMessage(userId, message) {
    const memory = loadMemory();
    if (!memory[userId]) memory[userId] = [];
    memory[userId].push({
        text: message,
        time: new Date().toISOString()
    });
    if (memory[userId].length > 20) memory[userId].shift(); // max 20 messages
    saveMemory(memory);
}

function getUserLastMessage(userId) {
    const memory = loadMemory();
    const messages = memory[userId];
    if (!messages || messages.length === 0) return null;
    return messages[messages.length - 1].text;
}

// ===== Goat Bot V2 Listener =====
// Example: startStableLogin({ onReady: (api) => {...} })
async function startMemoryBot(api) {
    api.listenMqtt((err, event) => {
        if (err) return console.error(err);

        const userId = event.senderID;
        const userMessage = event.body;

        if (!userMessage) return; // empty message skip

        // Save user message
        saveUserMessage(userId, userMessage);

        // Get last message
        const lastMessage = getUserLastMessage(userId);

        // Bot reply
        api.sendMessage(
            `Tumi last time bolle: "${lastMessage}"\nEkhon tumi bolle: "${userMessage}"`,
            event.threadID
        );
    });
}

// ===== Start Goat Bot with Memory =====
const { startStableLogin } = require("./login/stable-login");

startStableLogin({
    onReady: (api) => {
        console.log("[Goat Bot V2] Bot Ready! Memory system active.");
        startMemoryBot(api);
    }
});
