// Author: Azad

module.exports = {
  config: {
    name: "Azad bot",
    version: "1.0",
    author: "Azad", // remodified by cliff
    countDown: 5,
    role: 0,
    shortDescription: "no prefix",
    longDescription: "no prefix",
    category: "no prefix",
  },

  onStart: async function () {},

  onChat: async function ({ event, message }) {
    if (event.body && event.body.toLowerCase() === "azad bot") {
      return message.reply({
        body: `
Hey, my name is 𝐀𝐳𝐚𝐝 𝐁𝐨𝐭 ❄️
𝐇𝐨𝐰 𝐜𝐚𝐧 𝐈 𝐚𝐬𝐬𝐢𝐬𝐭 𝐲𝐨𝐮?
Owner: https://www.facebook.com/profile.php?id=61578365162382
        `,
      });
    }
  },
};
