/**
 * Source Code By Reza
 * Don't Forget Smile
 * Thank You :)
*/

const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType } = require("@adiwajshing/baileys");
const fs = require("fs");
const util = require("util");
const chalk = require("chalk");
const toMs = require('ms');
const { platform, send } = require("process");

const anonChat = JSON.parse(fs.readFileSync('./src/db_secret.json'))

const getGroupAdmins = (participants) => {
  let admins = []
  for (let i of participants) {
      i.admin === "superadmin" ? admins.push(i.id) :  i.admin === "admin" ? admins.push(i.id) : ''
  }
  return admins || []
}

require("./config");
module.exports = rezadevv = async (client, m, chatUpdate, store) => {
  try {
    var body =
      m.mtype === "conversation"
        ? m.message.conversation
        : m.mtype == "imageMessage"
        ? m.message.imageMessage.caption
        : m.mtype == "videoMessage"
        ? m.message.videoMessage.caption
        : m.mtype == "extendedTextMessage"
        ? m.message.extendedTextMessage.text
        : m.mtype == "buttonsResponseMessage"
        ? m.message.buttonsResponseMessage.selectedButtonId
        : m.mtype == "listResponseMessage"
        ? m.message.listResponseMessage.singleSelectReply.selectedRowId
        : m.mtype == "templateButtonReplyMessage"
        ? m.message.templateButtonReplyMessage.selectedId
        : m.mtype === "messageContextInfo"
        ? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text
        : "";
    var budy = typeof m.text == "string" ? m.text : "";
    // var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/"
    var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/";
    const isCmd2 = body.startsWith(prefix);
    const command = body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
    const botNumber = await client.decodeJid(client.user.id);
    const isCreator = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
    const args = body.trim().split(/ +/).slice(1);
    const pushname = m.pushName || "No Name";
    const itsMe = m.sender == botNumber ? true : false;
    let text = (q = args.join(" "));
    const arg = budy.trim().substring(budy.indexOf(" ") + 1);
    const arg1 = arg.trim().substring(arg.indexOf(" ") + 1);

    const from = m.chat;
    const reply = m.reply;
    const sender = m.sender;
    const mek = chatUpdate.messages[0];

    const color = (text, color) => {
      return !color ? chalk.green(text) : chalk.keyword(color)(text);
    };

    // Group
    const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch((e) => {}) : "";
    const groupName = m.isGroup ? groupMetadata.subject : "";
    const participants = m.isGroup ? await groupMetadata.participants : ''
    const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : ''
    const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false
    const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false

    // Secret Message
    const roomChat = Object.values(anonChat).find(room => [room.a, room.b].includes(sender) && room.state == 'CHATTING')
    const roomA = Object.values(anonChat).find(room => room.a == m.sender)
    const roomB = Object.values(anonChat).find(room => room.b == m.sender )
    const room = Object.values(anonChat).find(room => room.state == 'WAITING' && room.b == "")

    if (roomChat && !isCmd2 && !m.isGroup && roomChat.b !=="") {
      let other = [roomChat.a, roomChat.b].find(user => user !== sender)
      m.copyNForward(other, true)
      }

      if (room && Date.now() >= room.expired) {
        await client.sendMessage(room.a, {text:"```Not Found```"})
        anonChat.splice(anonChat.indexOf(room, 1)) 
        fs.writeFileSync('./src/db_secret.json', JSON.stringify(anonChat))
      }

    // Push Message To Console
    let argsLog = budy.length > 30 ? `${q.substring(0, 30)}...` : budy;

    if (isCmd2 && !m.isGroup) {
      console.log(chalk.black(chalk.bgWhite("[ PESAN ]")), color(argsLog, "turquoise"), chalk.magenta("From"), chalk.green(pushname), chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`));
    } else if (isCmd2 && m.isGroup) {
      console.log(
        chalk.black(chalk.bgWhite("[ PESAN ]")),
        color(argsLog, "turquoise"),
        chalk.magenta("From"),
        chalk.green(pushname),
        chalk.yellow(`[ ${m.sender.replace("@s.whatsapp.net", "")} ]`),
        chalk.blueBright("IN"),
        chalk.green(groupName)
      );
    }

    if (isCmd2) {
      switch (command) {
        case "secret" : case "confes" : {
          if (m.isGroup) return m.reply('Khusus Private Chat')
          let nomor = text.split("|")[0].replace(/[^0-9]/g, '')
          let pengirim = text.split("|")[1]
          let pesan = text.split("|")[2]
          let cek_nomor = await client.onWhatsApp(nomor + '@s.whatsapp.net') 
          if (cek_nomor.length === 0) return m.reply('```Nomor Tidak Terdaftar Di WhatsApp```')
          if (nomor === botNumber.replace("@s.whatsapp.net", "")) return m.reply('```Ini Adalah Nomor Bot```')
          if (nomor === sender.replace("@s.whatsapp.net", "")) return m.reply('```Ini Adalah Nomor Anda```')
          if (!nomor && !pengirim && !pesan) return m.reply(`Lengkapi Semua Dengan Format ${prefix + command} 6285xxxxxxxxx|Reyhan|Halo Anisa`)
          let text_nya = `*----PESAN RAHASIA----*\n\n_Ada pesan rahasia buat kamu nih balas dengan sopan yah pesan ini hanya terhubung dengan anda dan pengirim pesan!_\n\n👉Dari: ${pengirim}\n💌Pesan: ${pesan}`
          let buttons = [
            { buttonId : `${prefix}create_room_chat ${sender.replace("@s.whatsapp.net", "")} `, buttonText: { displayText: 'Terima Pesan 😊' }, type: 1 }
          ]
          client.sendButtonText(nomor + '@s.whatsapp.net', buttons, text_nya, 'click button reply message', m)
          setTimeout(() => {
            m.reply('```Sukses Mengirim Secret Message```')
          }, 3000)
        }
        break;
        case "create_room_chat" : {
          if (m.isGroup) return m.reply('Khusus Private Chat')
          if (!text) return m.reply('```Text Not Found```')
          if (roomA || roomB) return m.reply(`_Kamu sedang dalam room chat ketik ${prefix}stopsecret untuk menghapus sesi_`)
          client.sendMessage(text + '@s.whatsapp.net', {text: 'Chat Secret Terhubung✓'})
          let id = + new Date
          const obj = {
            id,
            a: sender,
            b: text + '@s.whatsapp.net',
            state: "CHATTING",
            expired: "5m"
          }
          anonChat.push(obj)
          fs.writeFileSync('./src/db_secret.json', JSON.stringify(anonChat))
          setTimeout(() => {
            m.reply(`*_Anda Sudah Dapat Mengirim Pesan Dengan Pengirim Pesan Rahasia Sebelumnya_*\n\nKetik ${prefix}stopsecret untuk mengahpus sesi ini`)
          }, 3000)
        }
        break;
        case "stopsecret" : {
          if (m.isGroup) return m.reply('Khusus Private Chat')
          if(roomA && roomA.state == "CHATTING"){
            await client.sendMessage(roomA.b, {text: '```Yah dia telah meninggalkan chat :)```'})
            await setTimeout(() => {
              m.reply('```Kamu telah keluar dari sesi ini```')
              roomA.a = roomA.b
              roomA.b = ""
              roomA.expired = Date.now() + toMs("5m")
              fs.writeFileSync('./src/db_secret.json', JSON.stringify(anonChat))
            }, 1000)
          } else if(roomA && roomA.state == "WAITING"){
            m.reply('```Kamu telah keluar dari sesi ini```')
            anonChat.splice(anonChat.indexOf(roomA, 1))
            fs.writeFileSync('./src/db_secret.json', JSON.stringify(anonChat))
          } else if(roomB && roomB.state == "CHATTING"){
            await client.sendMessage(roomB.a,{text: `_Partnermu telah meninggalkan sesi_`})
            m.reply("```Kamu telah keluar dari sesi dan meninggalkan nya```")
            roomB.b =""
            roomB.state = "WAITING"
            roomB.expired = Date.now() + toMs("5m")
            fs.writeFileSync('./src/db_secret.json', JSON.stringify(anonChat))
          } else m.reply('```Kamu Tidak Berada Dalam Sesi```')
        }
        break;
        default: {
          if (isCmd2 && budy.toLowerCase() != undefined) {
            if (m.chat.endsWith("broadcast")) return;
            if (m.isBaileys) return;
            if (!budy.toLowerCase()) return;
            if (argsLog || (isCmd2 && !m.isGroup)) {
              // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
              console.log(chalk.black(chalk.bgRed("[ ERROR ]")), color("command", "turquoise"), color(`${prefix}${command}`, "turquoise"), color("tidak tersedia", "turquoise"));
            } else if (argsLog || (isCmd2 && m.isGroup)) {
              // client.sendReadReceipt(m.chat, m.sender, [m.key.id])
              console.log(chalk.black(chalk.bgRed("[ ERROR ]")), color("command", "turquoise"), color(`${prefix}${command}`, "turquoise"), color("tidak tersedia", "turquoise"));
            }
          }
        }
      }
    }
  } catch (err) {
    m.reply(util.format(err));
  }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});
