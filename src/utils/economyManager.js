const fs = require('fs');
const path = require('path');

const economyPath = path.join(__dirname, '../data/economy.json');

const getEconomy = () => {
    const data = fs.readFileSync(economyPath, 'utf8');
    return data ? JSON.parse(data) : {};
};

const saveEconomy = (data) => {
    fs.writeFileSync(economyPath, JSON.stringify(data, null, 4));
};

module.exports = {
    getEconomy,
    saveEconomy
};
