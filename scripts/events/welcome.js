// Welcome Command with Ultra-Premium Style
// Author: Azad

const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "welcome",
    version: "4.0",
    author: "Azad",
    countDown: 5,
    role: 0,
    shortDescription: "Welcome new members with style",
    longDescription: "Sends a premium styled welcome message when a member joins",
    category: "group",
  },

  onJoin: async function ({ event, api }) {
    const userName = event.participantNames[0] || "New Member";
    const boxName = event.threadName || "Our Group";
    const session = moment().tz("Asia/Dhaka").format("dddd, MMMM Do YYYY, h:mm A");
    const adderName = (await api.getUserInfo(event.author))[event.author]?.name || "Admin";

    const welcomeMsg = `
╔══════════════════════════════╗
       🌟✨  W  E  L  C  O  M  E  ✨🌟
╚══════════════════════════════╝

╔══════════════════════════════╗
👑  N E W   S T A R   J O I N E D  
✨  ${userName}  ✨
╚══════════════════════════════╝

╔══════════════════════════════╗
🏠  F A M I L Y :  
💖  ${boxName}  💖
╚══════════════════════════════╝

╔══════════════════════════════╗
⏰  T I M E   Z O N E :  
🕒  ${session}
╚══════════════════════════════╝

╔══════════════════════════════╗
🙌  W E L C O M E D   B Y :  
🌈  ${adderName}
╚══════════════════════════════╝

╔══════════════════════════════╗
💬  We’re beyond excited to have you here!  
🔥  Let’s make memories & share smiles 😄  
🎉  Enjoy your stay & shine bright ✨
╚══════════════════════════════╝
    `;

    api.sendMessage(welcomeMsg, event.threadID);
  }
};
