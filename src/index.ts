import CookiecordClient from "cookiecord";
import { Intents } from "discord.js";
import dotenv from "dotenv-safe";

dotenv.config();

const client = new CookiecordClient({
    botAdmins: process.env.BOT_ADMINS?.split(","),
    prefix: "yp!"
}, {
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS]
});

client.loadModulesFromFolder("src/modules");
client.reloadModulesFromFolder("src/modules");
client.login(process.env.TOKEN);
client.on("ready", () => console.log(`Logged in as ${client.user?.tag}`));
