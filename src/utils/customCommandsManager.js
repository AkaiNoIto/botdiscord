const fs = require('fs');
const path = require('path');

const commandsPath = path.join(__dirname, '../data/customCommands.json');

const getCustomCommands = () => {
    try {
        if (!fs.existsSync(commandsPath)) return {};
        const data = fs.readFileSync(commandsPath, 'utf8');
        return data ? JSON.parse(data) : {};
    } catch { return {}; }
};

const saveCustomCommands = (data) => {
    fs.writeFileSync(commandsPath, JSON.stringify(data, null, 4));
};

module.exports = {
    getCustomCommands,
    saveCustomCommands
};
