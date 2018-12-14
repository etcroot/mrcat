const Discord = require('discord.js');
const client = new Discord.Client();
const cfg = require('./src/config.json');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const SQLite = require("better-sqlite3");
const sql = new SQLite('./src/db.sqlite');
const { get } = require("superagent");
const randomPuppy = require('random-puppy');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);  
  const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'scores';").get();
  if (!table['count(*)']) {
    sql.prepare("CREATE TABLE scores (id TEXT PRIMARY KEY, user TEXT, guild TEXT, points INTEGER);").run();
    sql.prepare("CREATE UNIQUE INDEX idx_scores_id ON scores (id);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
  }
  client.getScore = sql.prepare("SELECT * FROM scores WHERE user = ? AND guild = ?");
  client.setScore = sql.prepare("INSERT OR REPLACE INTO scores (id, user, guild, points) VALUES (@id, @user, @guild, @points);");
  client.user.setActivity(`${cfg.prefix}help | ${client.guilds.size} guilds`, { type: 'WATCHING' });
});

client.on("message", async (message) => {
  const emcolor = "#363942";
  let score;
  if (message.guild) {
    score = client.getScore.get(message.author.id, message.guild.id);
    if (!score) {
      score = { id: `${message.guild.id}-${message.author.id}`, user: message.author.id, guild: message.guild.id, points: 0 }
    }
    score.points++;
    client.setScore.run(score);
  }
  // Prefix & Random shit.
  if (message.author.bot) return;
  if (message.content.indexOf(cfg.prefix) !== 0) return;
  const args = message.content.slice(cfg.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  // Help Command
  if (command === "help") {
    const embed = new MessageEmbed()
    .setTitle('__Mr.Cat Commands 101__')
    .setDescription('All commands uses `mr.`')
    .addField('__General__', `\`${cfg.prefix}help\` - get cat help.\n\`${cfg.prefix}ping\` - get cat ping.\n\`${cfg.prefix}info\` - cat info.\n\`${cfg.prefix}inv\` - invite me.\n\`${cfg.prefix}support\` - cat support hotline.\n`, true)
    .addField('__Rank__', `\`${cfg.prefix}catnips\` - see catnips.\n\`${cfg.prefix}lb\` - show catnipboard.\n\`${cfg.prefix}howto\` - how to catnip.`, true)
    .addField('__Catlicious__', `\`${cfg.prefix}cat\` - get cat.\n\`${cfg.prefix}catmeme\` - get catmeme.\n\`${cfg.prefix}sadcat\` - get sad cat.\n`, true)
    .addField('__Normies__', `\`${cfg.prefix}meme\` - generic meme.\n\`${cfg.prefix}meirl\` - you irl.`, true)
    .setFooter('Gib mouse, thanks.')
    .setColor(emcolor)
    .setThumbnail(client.user.displayAvatarURL())
    return message.channel.send(embed);
  }
  // Info Command
  if (command === "info") {
    const moment = require('moment');
    require('moment-duration-format');
    const embed = new MessageEmbed()
    .setTitle('__Mr.Cat\'s Info__')
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription(`SKreee, i'm Mr.Cat... Your personal cat provider & catnip dealer.`)
    .addField('__Guilds__', client.guilds.size, true)
    .addField('__Users__', client.users.size, true)
    .addField('__Emojis__', client.emojis.size, true)
    .addField('__Channels__', client.channels.size, true)
    .addField('__Uptime__', moment.duration(client.uptime).format('d[d ]h[h ]m[m ]s[s]'), true)
    .addField('__Memory Usage__', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, true)
    .addField('__Prefix__', '`mr.`', true)
    .addField('__Developer__', '<@484765734803734540>', true)
    .setFooter('Gib mouse, thanks.')
    .setColor(emcolor)
    return message.channel.send(embed);
  }
  // Ping Command
  if (command === "ping") {
      return message.channel.send(`\`${client.ws.ping}ms\``);
  }
  // Check your rank
  if(command === "catnips") {
    return message.reply(`You currently have ${score.points} catnips!`);
  }
  // Invite Cat
  if(command === "inv") {
    return message.reply(`Eh... <https://discordapp.com/oauth2/authorize?client_id=523140098372665344&scope=bot&permissions=67488832>`);
  }
  // Support Hotline
  if(command === "support") {
    return message.reply(`https://discord.gg/UrtVQZp`);
  }
  // Leaderboard
  if(command === "lb") {
    const top10 = sql.prepare("SELECT * FROM scores WHERE guild = ? ORDER BY points DESC LIMIT 10;").all(message.guild.id);
    const embed = new MessageEmbed()
      .setTitle("Leaderboard")
      .setDescription("Our top 10 catnip leaders!")
      .setColor(emcolor);
   
    for(const data of top10) {
      embed.addField(client.users.get(data.user).tag, `${data.points} catnips`);
    }
    return message.channel.send({embed});
  }
  // How To Catnip
  if(command === "howto") {
    return message.channel.send(`It's easy... Just be active in chat and your catnips will get delivered to you.`);
  }
  // Give Points
  if(command === "give") {
    if(message.author.id !== cfg.owner) return;
   
    const user = message.mentions.users.first() || client.users.get(args[0]);
    if(!user) return message.reply("You must mention someone or give their ID!");
   
    const pointsToAdd = parseInt(args[1], 10);
    if(!pointsToAdd) return message.reply("You didn't tell me how many points to give...")
    let userscore = client.getScore.get(user.id, message.guild.id);
    if (!userscore) {
      userscore = { id: `${message.guild.id}-${user.id}`, user: user.id, guild: message.guild.id, points: 0, level: 1 }
    }
    userscore.points += pointsToAdd;
    let userLevel = Math.floor(0.1 * Math.sqrt(score.points));
    userscore.level = userLevel;
    client.setScore.run(userscore);
   
    return message.channel.send(`${user.tag} has received ${pointsToAdd} catnips and now stands at ${userscore.points} catnips.`);
  }
  // Say
  if(command === "say"){
    let text = args.join(" ");
    if(!text) {
      return message.channel.send('Specify something to say.');
    }
    message.delete().catch(O_o=>{}); 
    message.channel.send(text);
  }
  // Cat Facts
  if(command === "catfact") {
    const fact = await get("https://catfact.ninja/fact")
      .then((res) => res.body.fact);
    return message.channel.send(`📢 **Catfact:** *${fact}*`);
  }
  // Cat Memes
  if(command === "catmeme") {
    randomPuppy('Catmemes')
    .then(url => {
        const embed = new MessageEmbed()
        .setImage(url)
        .setColor(emcolor)
     return message.channel.send({ embed });
})
  }
  // LolCats
  if(command === "sadcat") {
    randomPuppy('sadcats')
    .then(url => {
        const embed = new MessageEmbed()
        .setImage(url)
        .setColor(emcolor)
     return message.channel.send({ embed });
})
  }
  // cats
  if(command === "cat") {
    randomPuppy('cats')
    .then(url => {
        const embed = new MessageEmbed()
        .setImage(url)
        .setColor(emcolor)
     return message.channel.send({ embed });
})
  }
  // Memes
  if(command === "meme") {
    randomPuppy('wholesomememes')
    .then(url => {
        const embed = new MessageEmbed()
        .setImage(url)
        .setColor(emcolor)
     return message.channel.send({ embed });
})
  }
  // Me IRL
  if(command === "meirl") {
    randomPuppy('Me_irl')
    .then(url => {
        const embed = new MessageEmbed()
        .setImage(url)
        .setColor(emcolor)
     return message.channel.send({ embed });
})
  }
});

client.login(cfg.token);