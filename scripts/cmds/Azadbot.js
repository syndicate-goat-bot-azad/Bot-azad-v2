module.exports = {
 config: {
	 name: "Azad bot",
	 version: "1.0",
	 author: "Hasan",//remodified by cliff
	 countDown: 5,
	 role: 0,
	 shortDescription: "no prefix",
	 longDescription: "no prefix",
	 category: "no prefix",
 },

 onStart: async function(){}, 
 onChat: async function({ event, message, getLang }) {
 if (event.body && event.body.toLowerCase() === "Azad bot") {
 return message.reply({
 body: `
       Hey My Name  Is Azad bot ❄️
       𝐻𝑜𝑤 𝑐𝑎𝑛 𝑖 𝑎𝑠𝑠𝑖𝑠𝑡 𝑦𝑜𝑢 ?
       𝑂𝑊𝑁𝐸𝑅 :https://www.facebook.com/profile.php?id=61578365162382 `
        });
      }
   }
}
