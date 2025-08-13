const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "welcome",
    version: "3.1",
    author: "Azad Vai x Fahad",
    role: 0,
    shortDescription: "Stylish welcome message",
    longDescription: "Creates a neon welcome card for new members with profile pic and time.",
    category: "group",
    guide: { en: "{pn}" }
  },

  onStart: async function () {
    console.log("✅ welcome.js (neon canvas version) loaded");
  },

  onEvent: async function ({ event, message, threadsData }) {
    if (event.logMessageType !== "log:subscribe") return;

    const threadID = event.threadID;
    const addedUsers = event.logMessageData.addedParticipants;
    const threadInfo = await threadsData.get(threadID);
    const groupName = threadInfo.threadName || "your group";

    for (const user of addedUsers) {
      const userID = user.userFbId || user.userID;
      const userName = user.fullName || "Friend";
      const time = moment().tz("Asia/Dhaka").format("hh:mm A - MMM Do YYYY");

      const avatarURL = `https://graph.facebook.com/${userID}/picture?width=800&height=800&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;

      const cache = path.join(__dirname, "cache");
      fs.ensureDirSync(cache);
      const cardPath = path.join(cache, `${userID}_welcome.png`);

      try {
        // Fetch and load avatar directly
        const { data } = await axios.get(avatarURL, { responseType: "arraybuffer" });
        const avatar = await loadImage(data);

        // Create canvas (bigger)
        const canvas = createCanvas(800, 400);
        const ctx = canvas.getContext("2d");

        // Background
        ctx.fillStyle = "#111118";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Bigger neon avatar
        const centerX = 200, centerY = 200, radius = 120;

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 40;
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 8;
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, centerX - radius, centerY - radius, radius * 2, radius * 2);
        ctx.restore();

        // Only name
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 40px Arial";
        ctx.fillText(userName, 400, 180);

        ctx.fillStyle = "#00ffff";
        ctx.font = "24px Arial";
        ctx.fillText(`📌 ${groupName}`, 400, 230);

        ctx.fillStyle = "#dddddd";
        ctx.fillText(`🕓 ${time}`, 400, 280);

        const buffer = canvas.toBuffer("image/png");
        fs.writeFileSync(cardPath, buffer);

        await message.send({
          body: `✨ ${userName} joined ${groupName}!`,
          attachment: fs.createReadStream(cardPath)
        });

        // Cleanup
        if (fs.existsSync(cardPath)) fs.unlink(cardPath, () => {});
      } catch (err) {
        console.error("❌ Error sending welcome image:", err);
        await message.send(`👋 ${userName}\n📌 ${groupName}\n🕓 ${time}`);
      }
    }
  }
};
