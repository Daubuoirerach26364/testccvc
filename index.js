const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  allowedMentions: { repliedUser: false },
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
      .setTitle('📖 Hướng dẫn - CCVC')
      .addFields(
        { name: '🏓 .cauca', value: 'abc' },
      )
      .setFooter({ text: 'Bản Beta 1.0.0' })
      .setTimestamp();

    message.reply({ embeds: [embed] });
    return;
  }
});

client.login(process.env.TOKEN);
