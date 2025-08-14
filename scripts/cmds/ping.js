const { createCanvas, registerFont } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "ping",
    aliases: ["running"],
    version: "1.5",
    author: "Chitron Bhattacharjee",
    role: 0,
    shortDescription: { en: "Show system ping and uptime" },
    longDescription: { en: "Displays accurate ping speed and system uptime using a canvas image." },
    category: "system",
    guide: { en: "Type 'plnn' or start a message with 'plnn'" }
  },

  onStart: async function ({ api, event }) {
    const timeStart = Date.now();
    await api.sendMessage("📡 Measuring real ping speed...", event.threadID);

    const ping = Date.now() - timeStart;
    const buffer = await generateCanvas(ping);
    const tempPath = path.join(__dirname, "cache", "shipu_ping.jpg");
    await fs.ensureDir(path.dirname(tempPath));
    await fs.writeFile(tempPath, buffer);

    return api.sendMessage({
      body: `𝗣𝗶𝗻𝗴 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲`,
      attachment: fs.createReadStream(tempPath)
    }, event.threadID);
  },

  onChat: async function ({ event, message }) {
    const text = event.body?.toLowerCase();
    if (!text) return;
    if (text === "ping" || text.startsWith("ping ")) {
      const timeStart = Date.now();
      const ping = Date.now() - timeStart;

      const buffer = await generateCanvas(ping);
      const tempPath = path.join(__dirname, "cache", "shipu_ping.jpg");
      await fs.ensureDir(path.dirname(tempPath));
      await fs.writeFile(tempPath, buffer);

      return message.reply({
        body: `𝗣𝗶𝗻𝗴 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲`,
        attachment: fs.createReadStream(tempPath)
      });
    }
  }
};

async function generateCanvas(ping) {
  const width = 700, height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  registerFont(path.join(__dirname, "assets", "font", "BeVietnamPro-Bold.ttf"), {
    family: "BeVietnamPro"
  });

  const theme = Math.floor(Math.random() * 10);
  const themes = [themeBlack, themeCyberpunk, themeRetro, themeNeon, themeLove, themeAnime, themeKawaii, themeMinimal, themeSunset, themeNeoGreen];
  themes[theme](ctx, width, height);

  ctx.font = "60px BeVietnamPro";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText("", width / 2, 90);

  ctx.font = "30px BeVietnamPro";
  ctx.fillStyle = "#ffccff";
  ctx.fillText("System Uptime", width / 2, 160);
  ctx.beginPath();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.moveTo(width / 2 - 150, 170);
  ctx.lineTo(width / 2 + 150, 170);
  ctx.stroke();

  const totalSecs = Math.floor(process.uptime());
  const d = Math.floor(totalSecs / (3600 * 24));
  const h = Math.floor((totalSecs % (3600 * 24)) / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = Math.floor(totalSecs % 60);
  const timeFormatted = `${d}D ${h}H ${m}M ${s}S`;

  ctx.font = "28px BeVietnamPro";
  ctx.fillStyle = "#ffffcc";
  ctx.fillText(`BOT UPTIME: ${timeFormatted}`, width / 2, 230);

  ctx.font = "25px BeVietnamPro";
  ctx.fillStyle = "#c0ffee";
  ctx.fillText(`⚡ Ping Speed: ${ping}ms`, width / 2, 300);

  return canvas.toBuffer("image/jpeg");
}

function themeBlack(ctx, w, h) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);
}

function themeCyberpunk(ctx, w, h) {
  ctx.fillStyle = "#0f0f0f";
  ctx.fillRect(0, 0, w, h);
  const neon = ctx.createLinearGradient(0, 0, w, h);
  neon.addColorStop(0, "#00f0ff");
  neon.addColorStop(1, "#ff00f0");
  ctx.strokeStyle = neon;
  ctx.lineWidth = 3;
  ctx.strokeRect(15, 15, w - 30, h - 30);
}

function themeRetro(ctx, w, h) {
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#2a003f");
  grad.addColorStop(1, "#8800cc");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.1})`;
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function themeNeon(ctx, w, h) {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, w, h);
  ctx.shadowColor = "#0ff";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "#0ff";
  ctx.fillRect(50, 50, w - 100, h - 100);
  ctx.shadowBlur = 0;
}

function themeLove(ctx, w, h) {
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, "#ff9a9e");
  gradient.addColorStop(1, "#fad0c4");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

function themeAnime(ctx, w, h) {
  ctx.fillStyle = "#fce4ec";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#ec407a";
  ctx.lineWidth = 5;
  ctx.strokeRect(10, 10, w - 20, h - 20);
}

function themeKawaii(ctx, w, h) {
  ctx.fillStyle = "#fff0f5";
  ctx.fillRect(0, 0, w, h);
  ctx.font = "20px BeVietnamPro";
  ctx.fillStyle = "#ff69b4";
  ctx.fillText("(｡♥‿♥｡)", w - 120, h - 20);
}

function themeMinimal(ctx, w, h) {
  ctx.fillStyle = "#202020";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#303030";
  ctx.fillRect(30, 30, w - 60, h - 60);
}

function themeSunset(ctx, w, h) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#ff9a9e");
  grad.addColorStop(1, "#fecfef");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function themeNeoGreen(ctx, w, h) {
  ctx.fillStyle = "#001100";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#00ff00";
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, w - 20, h - 20);
                               }
