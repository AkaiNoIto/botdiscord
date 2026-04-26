const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/adSystem.json');

const getAdData = () => {
    try {
        if (!fs.existsSync(filePath)) {
            if (!fs.existsSync(path.dirname(filePath))) {
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
            }
            fs.writeFileSync(filePath, JSON.stringify({}));
            return {};
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8') || '{}');
    } catch (e) {
        console.error("Error reading adSystem.json:", e);
        return {};
    }
};

const saveAdData = (data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    } catch (e) {
        console.error("Error saving adSystem.json:", e);
    }
};

module.exports = { getAdData, saveAdData };
