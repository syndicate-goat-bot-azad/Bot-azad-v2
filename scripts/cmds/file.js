const fs = require('fs');

module.exports = {
  config: {
    name: "givefile",
    aliases: ["file"],
    version: "1.0",
    author: "file",
    countDown: 5,
    role: 0,
    description: "extract file",
    category: "owner",
    guide: "{pn} Write a file name"
  },

  onStart: async function ({ message, args, api, event }) {
    const permission = ["61578106881179"];
    if (!permission.includes(event.senderID)) {
      return api.sendMessage("𝑐𝑚𝑑 𝑜𝑛𝑙𝑦 𝑎𝑑𝑚𝑖𝑛 𝑎𝑧𝑎𝑑 🦆", event.threadID, event.messageID);
    }

    const fileName = args[0];
    if (!fileName) {
      return api.sendMessage("🔰 𝚙𝚛𝚘𝚟𝚒𝚍𝚎 𝚊 𝚏𝚒𝚕𝚎 𝚗𝚊𝚖𝚎!", event.threadID, event.messageID);
    }

    const filePath = __dirname + `/${fileName}.js`;
    if (!fs.existsSync(filePath)) {
      return api.sendMessage(`File not found: ${fileName}.js`, event.threadID, event.messageID);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    api.sendMessage({ body: fileContent }, event.threadID);
  }
};
