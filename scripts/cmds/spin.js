// spin.js
/**
 * @author Azad
 */

const mongoose = require("mongoose");
require("dotenv").config();

// ===== MongoDB Connection =====
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb+srv://newazadbn:ZUehBNdbbX5Xqd1I@azad-bot.xnswz2t.mongodb.net/", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ MongoDB Connected (Spin Command)");
    } catch (err) {
        console.error("❌ MongoDB Connection Failed:", err);
    }
}
connectDB();

// ===== Spin User Schema =====
const spinUserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    name: { type: String, default: "Unknown" },
    money: { type: Number, default: 1000 },
    totalSpinWin: { type: Number, default: 0 }
});
const SpinUser = mongoose.model("SpinUser", spinUserSchema);

// ===== Spin Command =====
module.exports = {
    config: {
        name: "spin",
        version: "4.0",
        author: "Azad",
        countDown: 5,
        role: 0,
        description: "Spin and win/loss money. Use '/spin <amount>' or '/spin top'.",
        category: "game",
        guide: {
            en: "{p}spin <amount>\n{p}spin top"
        }
    },

    onStart: async function ({ message, event, args }) {
        const senderID = event.senderID;
        const subCommand = args[0];

        // ইউজার ডাটাবেস থেকে বের করো বা নতুন বানাও
        let user = await SpinUser.findOne({ userId: senderID });
        if (!user) {
            user = new SpinUser({ userId: senderID, money: 1000, name: `User_${senderID}` });
            await user.save();
        }

        // ✅ Leaderboard: /spin top
        if (subCommand === "top") {
            const top = await SpinUser.find({ totalSpinWin: { $gt: 0 } })
                .sort({ totalSpinWin: -1 })
                .limit(10);

            if (top.length === 0) {
                return message.reply("❌ No spin winners yet.");
            }

            const result = top.map((u, i) => {
                return `${i + 1}. ${u.name} – 💸 ${u.totalSpinWin} coins`;
            }).join("\n");

            return message.reply(`🏆 Top Spin Winners:\n\n${result}`);
        }

        // ✅ Spin bet: /spin <amount>
        const betAmount = parseInt(subCommand);
        if (isNaN(betAmount) || betAmount <= 0) {
            return message.reply("❌ Usage:\n/spin <amount>\n/spin top");
        }

        if (user.money < betAmount) {
            return message.reply(`❌ Not enough money.\n💰 Your balance: ${user.money}`);
        }

        // Bet deduct
        user.money -= betAmount;

        const outcomes = [
            { text: "💥 You lost everything!", multiplier: 0 },
            { text: "😞 You got back half.", multiplier: 0.5 },
            { text: "🟡 You broke even.", multiplier: 1 },
            { text: "🟢 You doubled your money!", multiplier: 2 },
            { text: "🔥 You tripled your bet!", multiplier: 3 },
            { text: "🎉 JACKPOT! 10x reward!", multiplier: 10 }
        ];

        const result = outcomes[Math.floor(Math.random() * outcomes.length)];
        const reward = Math.floor(betAmount * result.multiplier);
        user.money += reward;

        if (reward > betAmount) {
            const profit = reward - betAmount;
            user.totalSpinWin += profit;
        }

        await user.save();

        return message.reply(
            `${result.text}\n🎰 You bet: ${betAmount}$\n💸 You won: ${reward}$\n💰 New balance: ${user.money}$`
        );
    }
};
