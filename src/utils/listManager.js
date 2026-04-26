const fs = require('fs');
const path = require('path');

const listsPath = path.join(__dirname, '../data/lists.json');

const getLists = () => {
    return JSON.parse(fs.readFileSync(listsPath, 'utf8'));
};

const saveLists = (data) => {
    fs.writeFileSync(listsPath, JSON.stringify(data, null, 4));
};

module.exports = {
    getLists,
    saveLists,
    isWhitelisted: (id) => getLists().whitelist.includes(id),
    isBlacklisted: (id) => getLists().blacklist.includes(id)
};
