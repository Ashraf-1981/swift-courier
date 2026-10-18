const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

// Business rules: base64 image - file in backend/uploads, return its path
// 1. Only PNG or JPG
// 2. Random file name, so two uploads never overwrite each other
async function saveImage(base64) {
    const match = /^data:image\/(png|jpeg);base64,(.+)$/.exec(base64 || '');
    if (!match) {
        throw new Error('Image must be PNG or JPG');
    }

    const ext = match[1] === 'png' ? 'png' : 'jpg';
    const fileName = crypto.randomUUID() + '.' + ext;
    const folder = path.join(__dirname, '..', 'uploads');

    await fs.mkdir(folder, { recursive: true }); // create folder if missing
    await fs.writeFile(path.join(folder, fileName), Buffer.from(match[2], 'base64'));

    return '/uploads/' + fileName;
}

module.exports = { saveImage };