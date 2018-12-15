// Fetching modules & libs
const Discord = require('discord.js');
const client = new Discord.Client();
const cfg = require('./src/config.json');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const SQLite = require("better-sqlite3");
const sql = new SQLite('./src/db.sqlite');
const { get } = require("superagent");
const randomPuppy = require('random-puppy');
const ms = require("ms");
const Kitsu = require('kitsu.js');
const kitsu = new Kitsu();
var aq = require('animequote');
const booru = require('booru');

// Ready Event
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

// Guild Join event
client.on('guildCreate', () => {
  client.user.setActivity(`${cfg.prefix}help | ${client.guilds.size} guilds`, { type: 'WATCHING' });
});

// Guild Leave event
client.on('guildDelete', () => {
  client.user.setActivity(`${cfg.prefix}help | ${client.guilds.size} guilds`, { type: 'WATCHING' });
});

// Commands
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
  if(command === "help") {
  const cmd = args.join(" ");
  // Sending help message when only writing help.
  if(!args[0]) {
      let embed = new MessageEmbed()
      .setTitle('General Commands')
      .setColor(emcolor)
      .setFooter(`${client.user.username} | By: etcroot#6666`)
      .setDescription([`
      \`${cfg.prefix}help\` → get help menu.
      \`${cfg.prefix}info\` → get bot information.
      \`${cfg.prefix}ping\` → get bot current ping.
      \`${cfg.prefix}inv\` → invite me.
      \`${cfg.prefix}support\` → cat abuse hotline.
  `])
      .addField('More Commands', [`
          \`${cfg.prefix}help cat\` → get cat help.
          \`${cfg.prefix}help weeb\` → get weeb help.
          \`${cfg.prefix}help catnip\` → get catnip help.
          \`${cfg.prefix}help normie\` → get normie help.
          \`${cfg.prefix}help util\` → get util help.
      `])
      .addField('Prefix Information', `Prefix: \`${cfg.prefix}\``, false)
      return message.channel.send(embed);
  }
  // Catlicious
  if(cmd === 'cat') {
    let embed = new MessageEmbed()
    .setTitle('Help 101 → Catlicious')
    .setColor(emcolor)
    .setFooter(`${client.user.username} | By: etcroot#6666`)
    .setDescription([`
        \`${cfg.prefix}cat\` → get cat.
        \`${cfg.prefix}catmeme\` → get catmeme.
        \`${cfg.prefix}sadcat\` → get sad cat.
        \`${cfg.prefix}fact\` → get catfacts.
    `])
    return message.channel.send(embed);
}
// Weaboos
if(cmd === 'weeb') {
  let embed = new MessageEmbed()
  .setTitle('Help 101 → Weaboo')
  .setColor(emcolor)
  .setFooter(`${client.user.username} | By: etcroot#6666`)
  .setDescription([`
      \`${cfg.prefix}anime\` → random or search anime.
      \`${cfg.prefix}manga\` → search manga.
      \`${cfg.prefix}animeme\` → anime memes.
      \`${cfg.prefix}moe\` → moe's.
  `])
  return message.channel.send(embed);
}
// Catnips
if(cmd === 'catnip') {
  let embed = new MessageEmbed()
  .setTitle('Help 101 → Catnip')
  .setColor(emcolor)
  .setFooter(`${client.user.username} | By: etcroot#6666`)
  .setDescription([`
      \`${cfg.prefix}catnips\` → see catnips.
      \`${cfg.prefix}lb\` → show catnipboard.
  `])
  .addField('What is catnips & How do i gain them?', 'They\'re just catnips, gain by being active in chat, i might add something to do with them later.', false)
  return message.channel.send(embed);
}
// Normies
if(cmd === 'normie') {
  let embed = new MessageEmbed()
  .setTitle('Help 101 → Normies')
  .setColor(emcolor)
  .setFooter(`${client.user.username} | By: etcroot#6666`)
  .setDescription([`
      \`${cfg.prefix}meme\` → generic meme.
      \`${cfg.prefix}meirl\` → you irl.
  `])
  return message.channel.send(embed);
}
// Utility
if(cmd === 'util') {
  let embed = new MessageEmbed()
  .setTitle('Help 101 → Utility')
  .setColor(emcolor)
  .setFooter(`${client.user.username} | By: etcroot#6666`)
  .setDescription([`
      \`${cfg.prefix}remineme\` → forget much?
  `])
  return message.channel.send(embed);
}
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
    .setFooter('Mr.Cat | Gib mouse, thanks.')
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
    if(message.author.id !== cfg.owner) return;
    let text = args.join(" ");
    if(!text) {
      return message.channel.send('Specify something to say.');
    }
    message.delete().catch(O_o=>{}); 
    message.channel.send(text);
  }
  // Cat Facts
  if(command === "fact") {
    const fact = await get("https://catfact.ninja/fact")
      .then((res) => res.body.fact);
      const embed = new MessageEmbed()
      .setColor(emcolor)
      .setTitle('Catfact:')
      .setDescription(`${fact}`)
    return message.channel.send(embed);
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
  // Animeme
  if(command === "animeme") {
    randomPuppy('animemes')
    .then(url => {
        const embed = new MessageEmbed()
        .setImage(url)
        .setColor(emcolor)
     return message.channel.send({ embed });
})
  }
  // Moe
  if(command === "moe") {
    randomPuppy('awwnime')
    .then(url => {
        const embed = new MessageEmbed()
        .setImage(url)
        .setColor(emcolor)
     return message.channel.send({ embed });
})
  }
  // Remind Command
  if(command === "remindme") {
    let reminderTime = args[0];
      if(!reminderTime) return message.channel.send(`**Specify a time for me to remind you. Usage: \`${cfg.prefix}remind 15min | Code**\``);
      let reminder = args.slice(1).join(" ");
      let remindEmbed = new MessageEmbed()
      .setColor(emcolor)
      .addField("Reminder", `${reminder}`)
      .addField("Time", `\`${reminderTime}\``)
      message.channel.send(remindEmbed);
      setTimeout(function(){
        return message.author.send(`Hey! You wanted me to remind you: ${reminder}`)
      }, ms(reminderTime));
  }
  // Search Anime
  if(command === "anime") {
    var search = message.content.split(/\s+/g).slice(1).join(" ");
    if (!search) {
        kitsu.searchAnime(aq().quoteanime).then(result => {
            var anime = result[0]
            var embed = new MessageEmbed()
                .setColor(emcolor)
                .setAuthor(`${anime.titles.english} | ${anime.showType}`, anime.posterImage.original)
                .setDescription(anime.synopsis.replace(/<[^>]*>/g, '').split('\n')[0])
                .addField('❯\u2000\Information', `•\u2000\**Japanese Name:** ${anime.titles.romaji}\n\•\u2000\**Age Rating:** ${anime.ageRating}\n\•\u2000\**NSFW:** ${anime.nsfw ? 'Yes' : 'No'}`, true)
                .addField('❯\u2000\Stats', `•\u2000\**Average Rating:** ${anime.averageRating}\n\•\u2000\**Rating Rank:** ${anime.ratingRank}\n\•\u2000\**Popularity Rank:** ${anime.popularityRank}`, true)
                .addField('❯\u2000\Status', `•\u2000\**Episodes:** ${anime.episodeCount ? anime.episodeCount : 'N/A'}\n\•\u2000\**Start Date:** ${anime.startDate}\n\•\u2000\**End Date:** ${anime.endDate ? anime.endDate : "Still airing"}`, true)
                .setImage(anime.posterImage.original);
            return message.channel.send(`Try watching **${anime.titles.english}**!`, { embed: embed });
        })

    } else {
        var search = message.content.split(/\s+/g).slice(1).join(" ");
        kitsu.searchAnime(search).then(result => {
            if (result.length === 0) {
                return message.channel.send(`No results found for **${search}**!`);
            }
            var anime = result[0]
            var embed = new MessageEmbed()
                .setColor(emcolor)
                .setAuthor(`${anime.titles.english ? anime.titles.english : search} | ${anime.showType}`, anime.posterImage.original)
                .setDescription(anime.synopsis.replace(/<[^>]*>/g, '').split('\n')[0])
                .addField('❯\u2000\Information', `•\u2000\**Japanese Name:** ${anime.titles.romaji}\n\•\u2000\**Age Rating:** ${anime.ageRating}\n\•\u2000\**NSFW:** ${anime.nsfw ? 'Yes' : 'No'}`, true)
                .addField('❯\u2000\Stats', `•\u2000\**Average Rating:** ${anime.averageRating}\n\•\u2000\**Rating Rank:** ${anime.ratingRank}\n\•\u2000\**Popularity Rank:** ${anime.popularityRank}`, true)
                .addField('❯\u2000\Status', `•\u2000\**Episodes:** ${anime.episodeCount ? anime.episodeCount : 'N/A'}\n\•\u2000\**Start Date:** ${anime.startDate}\n\•\u2000\**End Date:** ${anime.endDate ? anime.endDate : "Still airing"}`, true)
                .setImage(anime.posterImage.original);
            return message.channel.send({ embed });
        }).catch(err => {
            console.log(err)
            return message.channel.send(`No results found for **${search}**!`);
        });
    }
  }
  // Search Manga
  if(command === "manga") {
    var search = message.content.split(/\s+/g).slice(1).join(" ");
        if (!search) {
            return message.channel.send('Please provide me a manga to search for!');
        }
        kitsu.searchManga(search).then(result => {
            if (result.length === 0) {
                return message.channel.send(`No results found for **${search}**!`);
            }
            var manga = result[0]
            var embed = new MessageEmbed()
                .setColor(emcolor)
                .setAuthor(`${manga.titles.english}`, manga.posterImage.original)
                .setDescription(manga.synopsis.replace(/<[^>]*>/g, '').split('\n')[0])
                .addField('❯\u2000\Information', `•\u2000\**Japanese Name:** ${manga.titles.romaji}\n\•\u2000\**Age Rating:** ${manga.ageRating ? manga.ageRating : '`N/A`'}\n\•\u2000\**Chapters:** ${manga.chapterCount ? manga.chapterCount : '`N/A`'}`, true)
                .addField('❯\u2000\Stats', `•\u2000\**Average Rating:** ${manga.averageRating ? manga.averageRating : '`N/A`'}\n\•\u2000\**Rating Rank:** ${manga.ratingRank ? manga.ratingRank : '`N/A`'}\n\•\u2000\**Popularity Rank:** ${manga.popularityRank ? manga.popularityRank : '`N/A`'}`, true)
                .addField('❯\u2000\Status', `•\u2000\**Volumes:** ${manga.volumeCount ? manga.volumeCount : '`N/A`'}\n\•\u2000\**Start Date:** ${manga.startDate}\n\•\u2000\**End Date:** ${manga.endDate ? manga.endDate : "Ongoing"}`, true)
                .setImage(manga.posterImage.original);
            return message.channel.send({embed});
        }).catch(err => {
            console.log(err);
            return message.channel.send(`No results found for **${search}**!`)
        })
	}
});

client.login(cfg.token);