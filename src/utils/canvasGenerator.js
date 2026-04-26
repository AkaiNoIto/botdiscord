const { GlobalFonts, createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');

// Register simple font
// GlobalFonts.registerFromPath(path.join(__dirname, '../public/fonts/Roboto-Bold.ttf'), 'Roboto');

async function createWelcomeCard(member) {
    const canvas = createCanvas(700, 250);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#23272A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#3498DB';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

    // Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '30px sans-serif';
    ctx.fillText('Welcome to the server!', 250, 100);
    
    ctx.font = '45px sans-serif';
    ctx.fillText(member.user.username.toUpperCase(), 250, 160);

    // Avatar
    const avatarUrl = member.user.displayAvatarURL({ extension: 'png' });
    const avatar = await loadImage(avatarUrl);
    
    // Draw rounded avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(125, 125, 80, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 45, 45, 160, 160);
    ctx.restore();

    return canvas.toBuffer('image/png');
}

async function createLevelUpCard(member, level) {
    const canvas = createCanvas(700, 250);
    const ctx = canvas.getContext('2d');

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 700, 0);
    grad.addColorStop(0, '#8E44AD');
    grad.addColorStop(1, '#3498DB');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 35px sans-serif';
    ctx.fillText('LEVEL UP!', 250, 100);
    
    ctx.font = 'bold 60px sans-serif';
    ctx.fillStyle = '#F1C40F';
    ctx.fillText(`LEVEL ${level}`, 250, 165);

    ctx.font = '25px sans-serif';
    ctx.fillStyle = '#CCCCCC';
    ctx.fillText(member.user.username.toUpperCase(), 250, 210);

    // Avatar
    const avatarUrl = member.user.displayAvatarURL({ extension: 'png' });
    const avatar = await loadImage(avatarUrl);
    
    // Draw rounded avatar with glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#F1C40F';
    ctx.save();
    ctx.beginPath();
    ctx.arc(125, 125, 80, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 45, 45, 160, 160);
    ctx.restore();

    return canvas.toBuffer('image/png');
}

module.exports = { createWelcomeCard, createLevelUpCard };
