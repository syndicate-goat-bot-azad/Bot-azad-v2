// Welcome Event Handler with Dynamic Canvas Card
// Author: Azad

const { getTime, drive } = global.utils;
const { createCanvas, loadImage, registerFont } = require("canvas");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
    config: {
        name: "welcome",
        version: "4.0",
        author: "Azad",
        category: "events"
    },

    langs: {
        // ... same langs as before (vi, en, bn)
        // shortened here for space, but keep them from previous code
    },

    onStart: async ({ threadsData, message, event, api, getLang }) => {
        if (event.logMessageType !== "log:subscribe") return;

        const { threadID, logMessageData } = event;
        const { addedParticipants } = logMessageData;
        const hours = parseInt(getTime("HH"), 10);
        const prefix = global.utils.getPrefix(threadID);
        const nickNameBot = global.GoatBot.config.nickNameBot;

        if (addedParticipants.some(u => u.userFbId === api.getCurrentUserID())) {
            if (nickNameBot) api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
            return message.send(getLang("welcomeMessage", prefix));
        }

        if (!global.temp.welcomeEvent[threadID]) {
            global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };
        }

        global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...addedParticipants);
        clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

        global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async () => {
            const threadData = await threadsData.get(threadID) || {};
            if (threadData?.settings?.sendWelcomeMessage === false) return;

            const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
            const bannedUsers = threadData?.data?.banned_ban || [];
            const threadName = threadData?.threadName || "this group";

            let newMembers = [], mentions = [];
            const isMultiple = dataAddedParticipants.length > 1;

            for (const user of dataAddedParticipants) {
                if (bannedUsers.some(b => b.id === user.userFbId)) continue;
                newMembers.push(user.fullName);
                mentions.push({ tag: user.fullName, id: user.userFbId });
            }

            if (!newMembers.length) return;

            const adderID = event.author;
            const adderInfo = await api.getUserInfo(adderID).catch(() => ({}));
            const adderName = adderInfo?.[adderID]?.name || "Someone";

            if (!newMembers.includes(adderName)) {
                mentions.push({ tag: adderName, id: adderID });
            }

            const session = hours < 11 ? getLang("session1") :
                            hours < 13 ? getLang("session2") :
                            hours < 19 ? getLang("session3") : getLang("session4");

            let welcomeMessage = threadData?.data?.welcomeMessage || getLang("defaultWelcomeMessage");
            welcomeMessage = welcomeMessage
                .replace(/\{userName\}|\{userNameTag\}/g, newMembers.join(", "))
                .replace(/\{boxName\}|\{threadName\}/g, threadName)
                .replace(/\{multiple\}/g, isMultiple ? getLang("multiple2") : getLang("multiple1"))
                .replace(/\{session\}/g, session)
                .replace(/\{adderName\}/g, adderName);

            // === Dynamic Welcome Card Creation ===
            const canvas = createCanvas(1000, 400);
            const ctx = canvas.getContext("2d");

            // Gradient background
            const gradient = ctx.createLinearGradient(0, 0, 1000, 400);
            gradient.addColorStop(0, "#4facfe");
            gradient.addColorStop(1, "#00f2fe");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Load profile picture of first member
            let avatarUrl = `https://graph.facebook.com/${dataAddedParticipants[0].userFbId}/picture?width=512&height=512`;
            const avatarImg = await loadImage((await axios.get(avatarUrl, { responseType: "arraybuffer" })).data);
            ctx.save();
            ctx.beginPath();
            ctx.arc(200, 200, 120, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatarImg, 80, 80, 240, 240);
            ctx.restore();

            // Text Styles
            ctx.fillStyle = "#fff";
            ctx.font = "bold 40px Arial";
            ctx.fillText("Welcome", 400, 150);

            ctx.font = "bold 30px Arial";
            ctx.fillText(newMembers.join(", "), 400, 210);

            ctx.font = "28px Arial";
            ctx.fillText(`To ${threadName}`, 400, 260);

            ctx.font = "25px Arial";
            ctx.fillText(`Have a great ${session}!`, 400, 310);

            // Save image to temp file
            const imgPath = path.join(__dirname, "welcome_card.png");
            const out = fs.createWriteStream(imgPath);
            const stream = canvas.createPNGStream();
            stream.pipe(out);
            await new Promise(resolve => out.on("finish", resolve));

            // Prepare form
            let form = {
                body: welcomeMessage,
                mentions,
                attachment: fs.createReadStream(imgPath)
            };

            // Add saved attachments from settings if available
            if (threadData?.data?.welcomeAttachment) {
                const files = threadData.data.welcomeAttachment;
                const attachments = files.map(file => drive.getFile(file, "stream"));
                const extra = (await Promise.allSettled(attachments))
                    .filter(r => r.status === "fulfilled")
                    .map(r => r.value);
                form.attachment = [fs.createReadStream(imgPath), ...extra];
            }

            // Send welcome message with image
            message.send(form);

            // Clean temp file
            setTimeout(() => fs.unlinkSync(imgPath), 5000);

            delete global.temp.welcomeEvent[threadID];
        }, 1500);
    }
};
