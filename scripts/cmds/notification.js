const { getStreamsFromAttachment } = global.utils;
const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "notification",
		aliases: ["notify", "noti"],
		version: "2.0",
		author: "NTKhang | Modified by Azad Vai",
		countDown: 5,
		role: 2,
		description: {
			vi: "Gửi thông báo từ admin đến tất cả các nhóm",
			en: "Send a stylish notification from admin to all groups"
		},
		category: "owner",
		guide: {
			en: "{pn} <your message>"
		},
		envConfig: {
			delayPerGroup: 250
		}
	},

	langs: {
		en: {
			missingMessage: "⚠️ Please enter the message you want to send to all groups",
			sendingNotification: "🚀 Sending notification to %1 groups...",
			sentNotification: "✅ Successfully sent notification to %1 groups!",
			errorSendingNotification: "❌ Failed to send to %1 groups:\n%2"
		}
	},

	onStart: async function ({ message, api, event, args, commandName, envCommands, threadsData, getLang }) {
		const { delayPerGroup } = envCommands[commandName];

		if (!args[0]) return message.reply(getLang("missingMessage"));

		const allThreads = (await threadsData.getAll()).filter(
			t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup
		);

		message.reply(getLang("sendingNotification", allThreads.length));

		const currentTime = moment.tz("Asia/Dhaka").format("DD/MM/YYYY hh:mm A");

		const formSend = {
			body: [
				"💌 𝗕𝗢𝗧 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡",
				"──────────────────────",
				`🕐 Time: ${currentTime}`,
				"🌐 From: Admin Bot",
				`✉️ Message:\n${args.join(" ")}`,
				"──────────────────────",
				"🤖 Powered by Azad Vai"
			].join("\n"),

			attachment: await getStreamsFromAttachment(
				[
					...event.attachments,
					...(event.messageReply?.attachments || [])
				].filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type))
			)
		};

		let sendSuccess = 0;
		const sendError = [];
		const waitingSend = [];

		for (const thread of allThreads) {
			try {
				waitingSend.push({
					threadID: thread.threadID,
					pending: api.sendMessage(formSend, thread.threadID)
				});
				await new Promise(resolve => setTimeout(resolve, delayPerGroup));
			} catch (e) {
				sendError.push(thread.threadID);
			}
		}

		for (const sended of waitingSend) {
			try {
				await sended.pending;
				sendSuccess++;
			} catch (e) {
				const { errorDescription } = e;
				const existing = sendError.find(item => item.errorDescription == errorDescription);
				if (existing) {
					existing.threadIDs.push(sended.threadID);
				} else {
					sendError.push({
						threadIDs: [sended.threadID],
						errorDescription
					});
				}
			}
		}

		let msg = "";
		if (sendSuccess > 0)
			msg += getLang("sentNotification", sendSuccess) + "\n";
		if (sendError.length > 0)
			msg += getLang(
				"errorSendingNotification",
				sendError.reduce((a, b) => a + b.threadIDs.length, 0),
				sendError.reduce((a, b) => a + `\n❌ ${b.errorDescription}:\n   ➤ ${b.threadIDs.join("\n   ➤ ")}`, "")
			);
		message.reply(msg);
	}
};
