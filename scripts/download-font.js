import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fontUrl = 'https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Bold.woff2';
const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Inter-Bold.ttf');

// Create fonts directory if it doesn't exist
if (!fs.existsSync(path.dirname(fontPath))) {
  fs.mkdirSync(path.dirname(fontPath), { recursive: true });
}

const file = fs.createWriteStream(fontPath);

https.get(fontUrl, (response) => {
  response.pipe(file);

  file.on('finish', () => {
    file.close();
    console.log('Font downloaded successfully!');
  });
}).on('error', (err) => {
  fs.unlink(fontPath, () => {}); // Delete the file if download fails
  console.error('Error downloading font:', err);
}); 