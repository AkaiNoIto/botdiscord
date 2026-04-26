# Nexus Door Discord Bot

A multi-purpose Discord bot with moderation, music, games, and event features.

## Features

- **Moderation**: `/kick`, `/ban`, `/clear`
- **Music**: `/play`, `/skip`, `/stop`
- **Games**: `/rps` (Rock Paper Scissors)
- **General**: `/ping`
- **Events**: Automated welcome messages for new members.

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Edit the `.env` file and replace the placeholders with your bot's information:
   - `DISCORD_TOKEN`: Your bot token from the [Discord Developer Portal](https://discord.com/developers/applications).
   - `CLIENT_ID`: Your bot's Application ID.

3. **Run the Bot**:
   ```bash
   node index.js
   ```

## Requirements

- Node.js 16.11.0 or higher.
- A Discord Bot with the following **Intents** enabled in the Developer Portal:
  - `Guilds`
  - `GuildMessages`
  - `MessageContent`
  - `GuildVoiceStates`
  - `GuildMembers` (Server Members Intent)
