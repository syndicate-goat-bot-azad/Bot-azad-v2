const axios = require('axios');
const hasan = "https://hasan-all-apis.onrender.com";

module.exports.config = {
    name: 'font',
    aliases: ['style'],
    version: '1.0',
    role: 0,
    countDowns: 5,
    author: '♡︎ 𝐻𝐴𝑆𝐴𝑁 ♡︎',
    description: 'convert normal text to stylish text',
    category: 'tools',
    guide: { en: '{pn} <font number> <text>' }
};

module.exports.onStart = async function ({ message, args }) {
    const texts = encodeURIComponent(args.slice(1).join(" "));
    const fontID = args[0];

    if (args[0] === 'list') {
        try {
            const response = await axios.get(`${hasan}/font/list`);
            const toxic = response.data.map(item => `${item.id}. ${item.example}`).join("\n");
            await message.reply(toxic); 
        } catch (error) {
            console.error('Error fetching font list:', error);
            await message.reply('Failed to fetch the font list.');
        }
        return;
    } 
    
    if (!texts || isNaN(fontID)) {
        return message.reply('Invalid command. Usage: {pn} <number> <text>');
    }

    try {
        const response = await axios.get(`${hasan}/font?text=${texts}&fontId=${fontID}`);
        const result = response.data.font;
        await message.reply(result);
    } catch (error) {
        console.error('Error converting text:', error);
        await message.reply('An error occurred while processing your request.');
    }
};
