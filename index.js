const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  allowedMentions: { repliedUser: false },
});

const spamTracker = new Map();
const SPAM_WINDOW = 3000;

// ---- Cấu hình anti-spam (có thể chỉnh bằng lệnh) ----
const antiSpamConfig = {
  enabled: true,
  limit: 3, // quá 3 tin nhắn liên tục
  mentionLimit: 5,
  emojiLimit: 10,
};

function countEmojis(text) {
  const customEmoji = text.match(/<a?:\w+:\d+>/g) || [];
  const unicodeEmoji = text.match(/\p{Extended_Pictographic}/gu) || [];
  return customEmoji.length + unicodeEmoji.length;
}

function isAdmin(message) {
  return message.member.permissions.has(PermissionsBitField.Flags.Administrator);
}

client.once('ready', () => {
  console.log(`Bot đã online: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;
  const now = Date.now();
  const content = message.content.toLowerCase().trim();

  // ---- Lệnh bật/tắt anti-spam ----
  if (content === '!antispam on' || content === '!antispam off') {
    if (!isAdmin(message)) {
      message.reply('❌ Chỉ admin mới dùng được lệnh này.');
      return;
    }
    antiSpamConfig.enabled = content === '!antispam on';
    message.reply(`✅ Anti-spam đã được **${antiSpamConfig.enabled ? 'BẬT' : 'TẮT'}**.`);
    return;
  }

  // ---- Lệnh chỉnh ngưỡng spam ----
  if (content.startsWith('!setspam')) {
    if (!isAdmin(message)) {
      message.reply('❌ Chỉ admin mới dùng được lệnh này.');
      return;
    }
    const num = parseInt(message.content.split(' ')[1]);
    if (!num || num <= 0) {
      message.reply('❗ Cú pháp: `!setspam <số tin nhắn>` (vd: `!setspam 5`)');
      return;
    }
    antiSpamConfig.limit = num;
    message.reply(`✅ Ngưỡng spam đã đổi thành **${num} tin nhắn liên tục**.`);
    return;
  }

  // ---- Logic anti-spam (chỉ chạy nếu đang bật) ----
  if (antiSpamConfig.enabled) {
    const mentionCount = message.mentions.users.size + message.mentions.roles.size;
    const emojiCount = countEmojis(message.content);

    if (mentionCount > antiSpamConfig.mentionLimit || emojiCount > antiSpamConfig.emojiLimit) {
      if (message.deletable) await message.delete().catch(() => {});
      const warnMsg = await message.channel.send(`⚠️ <@${userId}>, vui lòng không mention/emoji hàng loạt!`);
      setTimeout(() => warnMsg.delete().catch(() => {}), 2000);
      return;
    }

    if (!spamTracker.has(userId)) {
      spamTracker.set(userId, { messages: [] });
    }
    const userData = spamTracker.get(userId);
    userData.messages.push(message);
    userData.messages = userData.messages.filter((m) => now - m.createdTimestamp <= SPAM_WINDOW);

    if (userData.messages.length > antiSpamConfig.limit) {
      const toDelete = [...userData.messages];
      userData.messages = [];

      for (const m of toDelete) {
        if (m.deletable) await m.delete().catch(() => {});
      }

      const warnMsg = await message.channel.send(`⚠️ <@${userId}>, bạn đang spam! Vui lòng chat chậm lại.`);
      setTimeout(() => warnMsg.delete().catch(() => {}), 2000);
