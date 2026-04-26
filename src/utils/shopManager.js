const fs = require('fs');
const path = require('path');

const shopPath = path.join(__dirname, '../data/shop.json');

const getShop = () => {
    try {
        if (!fs.existsSync(shopPath)) return {};
        const data = fs.readFileSync(shopPath, 'utf8');
        return data ? JSON.parse(data) : {};
    } catch { return {}; }
};

const saveShop = (data) => {
    fs.writeFileSync(shopPath, JSON.stringify(data, null, 4));
};

module.exports = { getShop, saveShop };
