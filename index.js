const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`Bot đã online: ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  const content = message.content.toLowerCase().trim();

  // Lệnh help
  if (content === '!help') {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('📖 Danh sách lệnh')
      .setDescription('Dưới đây là các lệnh bạn có thể sử dụng:')
      .addFields(
        { name: '🏓 !ping', value: 'Kiểm tra độ trễ của bot' },
      )
      .setFooter({ text: 'Powered by discord.js' })
      .setTimestamp();

    message.reply({ embeds: [embed] });
    return;
  }
});

client.login(process.env.TOKEN);
