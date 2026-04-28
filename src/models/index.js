const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");

let cached = global.mongoose || { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Economy: { userId, balance }
const Economy = mongoose.model("Economy", new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 }
}));

// Levels: { guildId, userId, xp, level }
const Level = mongoose.model("Level", new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 }
}));

// Settings: { guildId, welcomeChannel, coinsPerMessage, ... }
const Settings = mongoose.model("Settings", new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  welcomeChannel: String,
  coinsPerMessage: { type: Number, default: 10 },
  coinsPerVoiceMinute: { type: Number, default: 6 },
  levelUpChannel: String,
  autoModEnabled: { type: Boolean, default: false }, leaveChannel: String, leaveMessage: String,
  ticketCategory: String, ticketAdminRole: String, ticketLogChannel: String,
  logMsgSend: String, logMsgEdit: String, logMsgDelete: String, logVoice: String,
  levelingEnabled: { type: Boolean, default: true }, welcomeMessage: String,
  adChannelId: String, adRoleId: String, adInitialPrice: { type: Number, default: 0 }, adRechargePrice: { type: Number, default: 0 }
}));

// BadWords: { guildId, words }
const BadWords = mongoose.model("BadWords", new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  words: [String]
}));

// CustomCommands: { guildId, commands }
const CustomCommands = mongoose.model("CustomCommands", new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  commands: { type: Map, of: new mongoose.Schema({ text: String, image: String }) }
}));

// Shop: { guildId, items }
const Shop = mongoose.model("Shop", new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  items: [{ id: String, name: String, description: String, price: Number, emoji: String, roleId: String, stock: Number }]
}));

// Stats: { guildId, history }
const Stats = mongoose.model("Stats", new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  history: [{ date: String, members: Number, wealth: Number }]
}));

// Lists: { whitelist, blacklist }
const Lists = mongoose.model("Lists", new mongoose.Schema({
  whitelist: [String],
  blacklist: [String]
}));

// BotStatus: { guilds, guildIds, users, uptime, lastUpdate }
const BotStatus = mongoose.model("BotStatus", new mongoose.Schema({
  guilds: Number,
  guildIds: [String],
  users: Number,
  uptime: Number,
  lastUpdate: Number
}));

module.exports = { connectDB, Economy, Level, Settings, BadWords, CustomCommands, Shop, Stats, Lists, BotStatus };


