require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { connectDB, Economy, Level, Settings, BadWords, CustomCommands, Shop, Stats, Lists, BotStatus } = require("./models");

async function migrate() {
  await connectDB();
  console.log("Connected to MongoDB");

  await Economy.deleteMany({});
  await Economy.insertMany([
    { userId: "1332430088565817355", balance: 160 },
    { userId: "709169728249135114", balance: 10 }
  ]);
  console.log("? Economy migrated");

  await Level.deleteMany({});
  await Level.insertMany([
    { guildId: "1444356345729122436", userId: "1332430088565817355", xp: 772, level: 1 },
    { guildId: "1444356345729122436", userId: "709169728249135114", xp: 24, level: 0 }
  ]);
  console.log("? Levels migrated");

  await Settings.deleteMany({});
  await Settings.create({ guildId: "1444356345729122436", welcomeChannel: "1444356346651873327", coinsPerMessage: 10, coinsPerVoiceMinute: 6, levelUpChannel: "1444356346903265367", autoModEnabled: true });
  console.log("? Settings migrated");

  await BadWords.deleteMany({});
  await BadWords.create({ guildId: "1444356345729122436", words: ["nul", "wesh"] });
  console.log("? BadWords migrated");

  await CustomCommands.deleteMany({});
  await CustomCommands.create({ guildId: "1444356345729122436", commands: { clan8: { text: "S????? V?????? 8", image: "https://cdn.discordapp.com/attachments/1401965098351988746/1462819173263478847/AISelect_20260115_224631_Gallery.gif" } } });
  console.log("? CustomCommands migrated");

  await Shop.deleteMany({});
  await Shop.create({ guildId: "1444356345729122436", items: [{ id: "item_6129", name: "couleur test", description: "article test", price: 10, emoji: "???", roleId: "1497346985458401484", stock: 0 }] });
  console.log("? Shop migrated");

  await Stats.deleteMany({});
  await Stats.create({ guildId: "1444356345729122436", history: [{ date: "2026-04-24", members: 2, wealth: 0 }, { date: "2026-04-26", members: 2, wealth: 0 }] });
  console.log("? Stats migrated");

  await Lists.deleteMany({});
  await Lists.create({ whitelist: ["1332430088565817355"], blacklist: [] });
  console.log("? Lists migrated");

  await BotStatus.deleteMany({});
  await BotStatus.create({ guilds: 1, guildIds: ["1444356345729122436"], users: 3, uptime: 0, lastUpdate: Date.now() });
  console.log("? BotStatus migrated");

  console.log("?? Migration complete!");
  process.exit(0);
}

migrate().catch(console.error);
