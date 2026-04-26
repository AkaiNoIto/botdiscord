import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Models
const CustomCommandsSchema = new mongoose.Schema({ guildId: { type: String, required: true, unique: true }, commands: { type: Map, of: new mongoose.Schema({ text: String, image: String }) } });
const SettingsSchema = new mongoose.Schema({ guildId: { type: String, required: true, unique: true }, welcomeChannel: String, coinsPerMessage: Number, coinsPerVoiceMinute: Number, levelUpChannel: String, autoModEnabled: Boolean, leaveChannel: String, leaveMessage: String });
const BadWordsSchema = new mongoose.Schema({ guildId: { type: String, required: true, unique: true }, words: [String] });
const ShopSchema = new mongoose.Schema({ guildId: { type: String, required: true, unique: true }, items: [{ id: String, name: String, description: String, price: Number, emoji: String, roleId: String, stock: Number }] });
const StatsSchema = new mongoose.Schema({ guildId: { type: String, required: true, unique: true }, history: [{ date: String, members: Number, wealth: Number }] });
const EconomySchema = new mongoose.Schema({ userId: { type: String, required: true, unique: true }, balance: { type: Number, default: 0 } });
const LevelSchema = new mongoose.Schema({ guildId: String, userId: String, xp: Number, level: Number });
const ListsSchema = new mongoose.Schema({ whitelist: [String], blacklist: [String] });

export const CustomCommands = mongoose.models.CustomCommands || mongoose.model("CustomCommands", CustomCommandsSchema);
export const Settings = mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
export const BadWords = mongoose.models.BadWords || mongoose.model("BadWords", BadWordsSchema);
export const Shop = mongoose.models.Shop || mongoose.model("Shop", ShopSchema);
export const Stats = mongoose.models.Stats || mongoose.model("Stats", StatsSchema);
export const Economy = mongoose.models.Economy || mongoose.model("Economy", EconomySchema);
export const Level = mongoose.models.Level || mongoose.model("Level", LevelSchema);
export const Lists = mongoose.models.Lists || mongoose.model("Lists", ListsSchema);

