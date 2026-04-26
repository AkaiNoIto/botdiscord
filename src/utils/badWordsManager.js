const fs = require('fs');
const path = require('path');

const badwordsPath = path.join(__dirname, '../data/badwords.json');

const getBadWords = () => {
    try {
        if (!fs.existsSync(badwordsPath)) return {};
        const data = fs.readFileSync(badwordsPath, 'utf8');
        return data ? JSON.parse(data) : {};
    } catch { return {}; }
};

const saveBadWords = (data) => {
    fs.writeFileSync(badwordsPath, JSON.stringify(data, null, 4));
};

module.exports = {
    getBadWords,
    saveBadWords
};
