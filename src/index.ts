import CookiecordClient, { HelpModule } from "cookiecord";
import { Intents } from "discord.js";
import dotenv from "dotenv-safe";
import FunModule from "./modules/fun";
import ProxyManager from "./modules/proxy";

dotenv.config();

const client = new CookiecordClient(
    {
        botAdmins: process.env.BOT_ADMINS?.split(","),
        prefix: "yp!",
    },
    {
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            Intents.FLAGS.GUILD_MEMBERS,
        ],
    }
);

// client.loadModulesFromFolder("src/modules");
// client.reloadModulesFromFolder("src/modules");
client.registerModule(HelpModule);
client.registerModule(ProxyManager);
client.registerModule(FunModule);
// client.registerModule(EphemeralModule);

client.login(process.env.TOKEN);
client.on("ready", () => console.log(`Logged in as ${client.user?.tag}`));
