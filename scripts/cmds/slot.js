/**
 * @author Azad
 */

const mongoose = require("mongoose");

// ===== MongoDB Connection =====
async function connectDB() {
    try {
        await mongoose.connect(
            "mongodb+srv://newazadbn:ZUehBNdbbX5Xqd1I@azad-bot.xnswz2t.mongodb.net/slotgame?retryWrites=true&w=majority",
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );
        console.log("✅ MongoDB Connected (Slot Command)");
    } catch (err) {
        console.error("❌ MongoDB Connection Failed:", err);
    }
}
connectDB();

// ===== Slot User Schema =====
const slotUserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    coins: { type: Number, default: 0 }
});
const SlotUser = mongoose.model("SlotUser", slotUserSchema);

// ===== Slot Command =====
module.exports = {
    config: {
        name: "slot",
        author: "Azad",
        description: "Play slot and win coins (MongoDB Saved)",
        category: "game"
    },
    onStart: async function ({ event, args, message }) {
        const userId = event.senderID;

        // ইউজার খুঁজে বের করো বা নতুন বানাও
        let user = await SlotUser.findOne({ userId });
        if (!user) {
            user = new SlotUser({ userId, coins: 1000 }); // নতুন ইউজারকে 1000 coin
            await user.save();
        }

        // Slot bet সেট করো
        const bet = parseInt(args[0]) || 100;
        if (bet <= 0) return message.reply("⚠️ Bet 0 বা negative হতে পারবে না!");
        if (user.coins < bet) return message.reply("💰 তোমার কাছে পর্যাপ্ত coin নেই!");

        // Slot symbols
        const symbols = ["🍒", "🍋", "🍊", "🍉", "⭐", "🔔"];
        const slot1 = symbols[Math.floor(Math.random() * symbols.length)];
        const slot2 = symbols[Math.floor(Math.random() * symbols.length)];
        const slot3 = symbols[Math.floor(Math.random() * symbols.length)];

        let result;
        if (slot1 === slot2 && slot2 === slot3) {
            const win = bet * 5;
            user.coins += win;
            result = `🎉 Jackpot! তুমি জিতেছো ${win} coin!`;
        } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
            const win = bet * 2;
            user.coins += win;
            result = `😊 ভালো! তুমি জিতেছো ${win} coin।`;
        } else {
            user.coins -= bet;
            result = `😢 হারালে ${bet} coin।`;
        }

        await user.save();

        message.reply(
            `🎰 [ ${slot1} | ${slot2} | ${slot3} ]\n${result}\n💰 তোমার মোট coin: ${user.coins}`
        );
    }
};
