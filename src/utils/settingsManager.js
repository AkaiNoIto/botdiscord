const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../data/settings.json');

const getSettings = () => {
    const data = fs.readFileSync(settingsPath, 'utf8');
    return data ? JSON.parse(data) : {};
};

const saveSettings = (data) => {
    fs.writeFileSync(settingsPath, JSON.stringify(data, null, 4));
};

module.exports = {
    getSettings,
    saveSettings
};
