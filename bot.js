require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const puppeteer = require('puppeteer');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!recover')) {
        const args = message.content.split(' ');
        const email = args[1];

        if (!email) {
            message.reply("Please provide an email: `!recover your_email@example.com`");
            return;
        }

        message.reply(`Starting recovery for **${email}**. Please wait...`);

        try {
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            await page.goto('https://account.live.com/acsr');

            // Fill email field
            await page.type('input[name="Email"]', email);

            // Screenshot Captcha for Manual Entry
            const captchaElement = await page.$('#captchaImage');
            if (captchaElement) {
                await captchaElement.screenshot({ path: 'captcha.png' });
                await message.reply({ content: "Solve this captcha:", files: ['captcha.png'] });
            } else {
                message.reply("No captcha detected. Proceeding...");
            }

            await browser.close();
        } catch (error) {
            console.error(error);
            message.reply("Error occurred during recovery.");
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
