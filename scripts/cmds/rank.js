// Author: Azad
// Animated Rank Card Command with Light Text, EXP Bar Animation, Owner, Coin & Public Group Name

const { createCanvas, loadImage } = require("canvas");
const GIFEncoder = require("gifencoder");
const fs = require("fs-extra");
const path = require("path");

class RankCard {
    constructor({ name, exp, expToLevelUp, level, rank, avatar, coins, groupName }) {
        this.name = name;
        this.exp = exp;
        this.expToLevelUp = expToLevelUp;
        this.level = level;
        this.rank = rank;
        this.avatar = avatar;
        this.coins = coins || 0;
        this.groupName = groupName || "";

        this.widthCard = 1000;
        this.heightCard = 300;
    }

    async buildAnimatedCard() {
        const width = this.widthCard;
        const height = this.heightCard;

        const encoder = new GIFEncoder(width, height);
        const tempPath = path.join(__dirname, `rank_${Date.now()}.gif`);
        const stream = fs.createWriteStream(tempPath);
        encoder.createReadStream().pipe(stream);

        encoder.start();
        encoder.setRepeat(0);
        encoder.setDelay(50); // 50ms per frame
        encoder.setQuality(10);

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");
        const bgImage = await loadImage("https://i.imgur.com/rk4wItb.jpeg");
        const avatarImg = await loadImage(this.avatar || "https://i.imgur.com/defaultAvatar.png");

        const steps = 20; // number of frames for animation
        for (let i = 1; i <= steps; i++) {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(bgImage, 0, 0, width, height);

            // Border
            ctx.strokeStyle = "rgba(255,255,255,0.8)";
            ctx.lineWidth = 5;
            ctx.strokeRect(0, 0, width, height);

            // Avatar
            ctx.save();
            ctx.beginPath();
            ctx.arc(150, 150, 100, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatarImg, 50, 50, 200, 200);
            ctx.restore();

            // Group Name
            ctx.font = "bold 20px Arial";
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctx.fillText(`Group: ${this.groupName}`, 300, 60);

            // Username
            ctx.font = "bold 40px Arial";
            ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
            ctx.fillText(this.name, 300, 120);

            // Level
            ctx.font = "30px Arial";
            ctx.fillStyle = "rgba(0, 255, 204, 0.6)";
            ctx.fillText(`Level: ${this.level}`, 300, 180);

            // Owner & Coin
            ctx.font = "bold 24px Arial";
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fillText("Owner: Azad", 800, 50);
            ctx.font = "bold 22px Arial";
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.fillText(`Coin: ${this.coins}`, 800, 90);

            // EXP Bar
            const barX = 300, barY = 230, barWidth = 650, barHeight = 25;
            ctx.fillStyle = "rgba(85, 85, 85, 0.7)";
            ctx.fillRect(barX, barY, barWidth, barHeight);

            const expPercent = Math.min(this.exp / this.expToLevelUp, 1) * (i / steps);
            const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
            gradient.addColorStop(0, "#ffcc00");
            gradient.addColorStop(1, "#ff6600");
            ctx.fillStyle = gradient;
            ctx.fillRect(barX, barY, barWidth * expPercent, barHeight);

            // EXP Text
            ctx.font = "20px Arial";
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            const expText = `${this.exp}/${this.expToLevelUp}`;
            ctx.fillText(expText, barX + barWidth - ctx.measureText(expText).width, barY + 20);

            // Rank
            ctx.font = "28px Arial";
            ctx.fillStyle = "rgba(255, 102, 102, 0.7)";
            ctx.fillText(`Rank: #${this.rank}`, 300, 280);

            encoder.addFrame(ctx);
        }

        encoder.finish();

        return new Promise(resolve => {
            stream.on("finish", () => resolve(tempPath));
        });
    }
}

module.exports = {
    config: {
        name: "rank",
        version: "2.1",
        author: "Azad",
        role: 0,
        shortDescription: "Show user animated rank card",
        longDescription: "Generate an animated rank card with light text, avatar, EXP bar animation, owner, coin, mention support, and public group name",
        category: "fun",
        guide: "{p}rank"
    },

    onStart: async function ({ api, event, usersData }) {
        try {
            let userId = event.senderID;

            if (event.mentions && Object.keys(event.mentions).length > 0) {
                userId = Object.keys(event.mentions)[0];
            }

            const userInfo = await usersData.get(userId);
            const avatarUrl = await usersData.getAvatarUrl(userId) || "https://i.imgur.com/defaultAvatar.png";

            let groupName = event.threadID;
            try {
                const threadInfo = await api.getThreadInfo(event.threadID);
                groupName = threadInfo.name || event.threadID;
            } catch (e) {
                console.error("Failed to get thread info:", e);
            }

            const card = new RankCard({
                name: userInfo.name || "Unknown",
                exp: userInfo.exp || 0,
                expToLevelUp: 100,
                level: userInfo.level || 1,
                rank: userInfo.rank || 1,
                avatar: avatarUrl,
                coins: userInfo.coins || 0,
                groupName: groupName
            });

            const filePath = await card.buildAnimatedCard();

            api.sendMessage(
                {
                    body: `🎖 ${userInfo.name}-এর Animated Rank Card`,
                    attachment: fs.createReadStream(filePath)
                },
                event.threadID,
                async () => {
                    fs.unlink(filePath, err => { if(err) console.error(err); });
                },
                event.messageID
            );

        } catch (e) {
            console.error(e);
            api.sendMessage("❌ Animated Rank card বানাতে সমস্যা হয়েছে!", event.threadID, event.messageID);
        }
    }
};
