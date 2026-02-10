
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Trying official Google Fonts repo
const fileUrl = 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansEthiopic/NotoSansEthiopic-Regular.ttf';
const outputPath = path.join(__dirname, '../src/assets/NotoSansEthiopic-Regular.ttf');

const file = fs.createWriteStream(outputPath);

https.get(fileUrl, function (response) {
    if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(() => {
                console.log('Download completed successfully.');
            });
        });
    } else {
        console.error(`Download failed with status code: ${response.statusCode}`);
        if (response.statusCode === 404) {
            console.error('File not found at new URL either.');
        }
        fs.unlink(outputPath, () => { });
    }
}).on('error', function (err) {
    fs.unlink(outputPath, () => { });
    console.error(`Error downloading file: ${err.message}`);
});
