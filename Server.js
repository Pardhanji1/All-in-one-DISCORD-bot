const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES", "GUILD_MEMBERS"] });

const prefix = '!';
const tasks = new Map(); // Temporary task storage
const badWords = ['badword1', 'badword2']; // Add your bad words

client.once('ready', () => {
    console.log('Bot is online!');
});

// Welcome Message
client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === 'welcome');
    if (channel) channel.send(`Welcome ${member.user.tag}! Enjoy your stay!`);
});

// Message Handler
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // Bad Word Filter
    if (badWords.some(word => message.content.toLowerCase().includes(word))) {
        message.delete();
        return message.reply('Please avoid using bad words!');
    }

    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Moderation: Kick
    if (command === 'kick') {
        if (!message.member.permissions.has('KICK_MEMBERS')) return message.reply('No permission!');
        const user = message.mentions.users.first();
        if (user) {
            const member = message.guild.members.resolve(user);
            if (member) {
                member.kick().then(() => message.reply(`${user.tag} was kicked!`));
            } else {
                message.reply('User not in server!');
            }
        } else {
            message.reply('Mention a user to kick!');
        }
    }

    // Music: Play
    if (command === 'play') {
        if (!message.member.voice.channel) return message.reply('Join a voice channel first!');
        const url = args[0];
        if (!ytdl.validateURL(url)) return message.reply('Invalid YouTube URL!');
        const connection = await message.member.voice.channel.join();
        const stream = ytdl(url, { filter: 'audioonly' });
        connection.play(stream, { seek: 0, volume: 1 });
        message.reply('Playing music!');
    }

    // Task Management: Add Task
    if (command === 'addtask') {
        const task = args.join(' ');
        if (!task) return message.reply('Please provide a task!');
        tasks.set(Date.now(), { user: message.author.id, task });
        message.reply(`Task added: ${task}`);
    }

    // Task Management: List Tasks
    if (command === 'tasks') {
        let reply = 'Your tasks:\n';
        for (const [id, task] of tasks) {
            if (task.user === message.author.id) reply += `- ${task.task}\n`;
        }
        message.reply(reply || 'No tasks found!');
    }

   36// Fun: Meme (using a simple response)
    if (command === 'meme') {
        message.reply('Here’s a meme! 😂 Check out https://reddit.com/r/memes for more!');
        // Future: Add meme API
    }
});

client.login('YOUR_BOT_TOKEN');
