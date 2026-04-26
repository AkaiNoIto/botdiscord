const fs = require('fs');
const path = require('path');

const levelsPath = path.join(__dirname, '../data/levels.json');

const getLevels = () => {
    const data = fs.readFileSync(levelsPath, 'utf8');
    return data ? JSON.parse(data) : {};
};

const saveLevels = (data) => {
    fs.writeFileSync(levelsPath, JSON.stringify(data, null, 4));
};

module.exports = {
    getLevels,
    saveLevels
};
