const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get(`https://raw.githubusercontent.com/KingsOfToxiciter/alldl/refs/heads/main/toxicitieslordhasan.json`);
  return base.data.hasan;
};

module.exports = {
  config: {
    name: "autolink",
    version: "1.0",
    author: "♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎",
    description: "Direct auto downloader",
    category: "media",
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    const url = event.body?.trim();
    const supported = [
      "https://www.tiktok.com", "https://www.facebook.com", "https://www.instagram.com", "https://youtu.be/", "https://youtube.com",
      "https://x.com", "https://twitter.com", "https://pin.it/", "https://vm.tiktok.com", "https://fb.watch", "https://vt.tiktok.com",
    ];

    if (!supported.some(domain => url?.startsWith(domain))) return;

    try {
      const res = await axios.get(`${await baseApiUrl()}/alldl?url=${encodeURIComponent(url)}`);
      const data = await global.utils.getStreamFromURL(res.data.url);

      await api.sendMessage({
        body: "✨ | Here is your Download video..!!",
        attachment: data
      }, event.threadID, event.messageID);
    } catch (e) {
      console.error(e);
      api.sendMessage("❌ | Download failed.\nerror: " + e.message, event.threadID, event.messageID);
    }
  },
};
