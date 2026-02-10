
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontPath = path.join(__dirname, '../src/assets/NotoSansEthiopic-Regular.ttf');
const outputPath = path.join(__dirname, '../src/constants/AmharicFont.js');

try {
    if (!fs.existsSync(fontPath)) {
        console.error(`Font file not found at ${fontPath}`);
        process.exit(1);
    }
    const fontBuffer = fs.readFileSync(fontPath);
    const fontBase64 = fontBuffer.toString('base64');

    const content = `export const AmharicFontBase64 = '${fontBase64}';`;

    fs.writeFileSync(outputPath, content);
    console.log('Successfully generated AmharicFont.js');
} catch (error) {
    console.error('Error generating font file:', error);
}
