const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "welcome",
    version: "3.0",
    author: "Azad Vai x Fahad",
    role: 0,
    shortDescription: "Stylish welcome message",
    longDescription: "Creates a neon welcome card for new members with profile pic and time.",
    category: "group",
    guide: {
      en: "{pn}"
    }
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

      const avatarURL = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;

      const cache = path.join(__dirname, "cache");
      fs.ensureDirSync(cache);
      const avatarPath = path.join(cache, `${userID}_avatar.png`);
      const cardPath = path.join(cache, `${userID}_welcome.png`);

      try {
        // Fetch profile picture
        const response = await axios.get(avatarURL, { responseType: "arraybuffer" });
        fs.writeFileSync(avatarPath, response.data);

        // Create canvas
        const canvas = createCanvas(700, 300);
        const ctx = canvas.getContext("2d");

        // Background
        ctx.fillStyle = "#111118";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Neon circle
        const avatar = await loadImage(avatarPath);
        const centerX = 140, centerY = 150, radius = 80;

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 8, 0, Math.PI * 2);
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 25;
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.restore();

        // Circular avatar
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, centerX - radius, centerY - radius, radius * 2, radius * 2);
        ctx.restore();

        // Text style
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 28px Arial";
        ctx.fillText(`👋 Welcome, ${userName}`, 250, 100);

        ctx.fillStyle = "#00ffff";
        ctx.font = "22px Arial";
        ctx.fillText(`📌 ${groupName}`, 250, 150);

        ctx.fillStyle = "#dddddd";
        ctx.fillText(`🕓 ${time}`, 250, 200);

        const buffer = canvas.toBuffer("image/png");
        fs.writeFileSync(cardPath, buffer);

        await message.send({
          body: `✨ Welcome ${userName} to ${groupName}!`,
          attachment: fs.createReadStream(cardPath)
        });

        // Cleanup
        fs.unlinkSync(avatarPath);
        fs.unlinkSync(cardPath);
      } catch (err) {
        console.error("❌ Error sending welcome image:", err.message);
        await message.send(`👋 Hello ${userName}!\n📌 Welcome to ${groupName}\n🕓 Joined: ${time}`);
      }
    }
  }
};
