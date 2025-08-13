global.roast2Interval = null;

module.exports = {
  config: {
    name: "roast",
    aliases: ["r", "chod"],
    version: "1.0",
    author: "Azad",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Danger gali roast",
    },
    longDescription: {
      en: "Roasts the mentioned user line by line with dangerous gali style!",
    },
    category: "Fun",
    guide: {
      en: "{pn} @mention",
    },
  },

  onStart: async function ({ message, api, event }) {
    const mentions = Object.keys(event.mentions);
    if (mentions.length === 0)
      return message.reply("❌ Please mention someone to roast!");

    const targetID = mentions[0];
    const targetName = event.mentions[targetID];
    const tagText = `@${targetName}`;

    const roasts = [
      "Teri shakal dekh ke lagta hai ki teri maa ne pregnancy mein April Fool bana diya tha! 🤡",
      "Tu toh aisa bawasir hai jo operation ke baad bhi wapas aa jata hai! 🩹",
      "Tere muh se baat nahi, galiyon ka dustbin girta hai! 🗑️",
      "Teri soch kachre ke truck ki badbu jaise hai — door se hi bardasht nahi hoti! 🚛",
      "Tu toh ghaas khaane wale bakre ka dimaag leke insaan ban gaya hai! 🐐",
      "Teri shakal dekh ke lagta hai bhagwan bhi regret karta hoga ki ‘Ye main ne banaya?’ 😬",
      "Tere jokes MC ki gali se bhi zyada chubhte hain! 🔪",
      "Tu toh saste tambaku ka packet hai — kholte hi ulti aati hai! 🚬",
      "Tera chehra lagta hai ki kisi ne chappal se sculpt kiya ho! 👡",
      "Teri soch gutter ka paani hai — bas gand hi gand! 💩",
      "Tu toh khule naale ka poster boy hai! 🪧",
      "Tere muh se awaaz nahi, galiyon ka remix nikalta hai! 🎶",
      "Tu gyaani nahi, galiyon ka pandit hai! 📿",
      "Tere muh se hawa nahi, pure sewer ka leakage aata hai! 🛢️",
      "Tera dimaag saste biryani ka chicken piece hai — aadha paka, aadha kachcha! 🍗",
      "Teri shakal dekh ke lagta hai filter bhi bolta hoga ‘Nikal la*de!’ 📸",
      "Tu toh woh nashili chewing gum hai jo jhaag bhi chhodti hai aur taste bhi bekaar! 🫧",
      "Tera sense MC-BC dictionary ka page number zero hai! 📚",
      "Teri aukaat roadside chhapri se bhi neeche hai! 🛣️",
      "Teri baat sun ke lagta hai ki life ka system format karke dobara install karna chahiye! 💻"
    ];

    let index = 0;
    const threadID = event.threadID;

    function sendRoast() {
      if (index < roasts.length) {
        api.sendMessage(
          {
            body: `${tagText}, ${roasts[index]}`,
            mentions: [{ id: targetID, tag: tagText }],
          },
          threadID,
          (err, info) => {
            global.lastRoast2Msg = info?.messageID;
          },
        );
        index++;
      } else {
        clearInterval(global.roast2Interval);
        global.roast2Interval = null;
      }
    }

    global.roast2Interval = setInterval(sendRoast, 1800);

    message.reply(
      `🔥 Gali Roast started for ${targetName}!\nType "stop" or "off" to cancel.`,
    );
  },

  onChat: async function ({ event, message }) {
    if (
      ["stop", "off"].includes(event.body?.toLowerCase()) &&
      global.roast2Interval
    ) {
      clearInterval(global.roast2Interval);
      global.roast2Interval = null;
      return message.reply("🛑 Roast cancelled!");
    }
  },
};
