const fs = require('fs');
const path = require('path');

// 创建一个简单的1x1透明PNG作为占位符
const transparentPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const publicDir = path.join(__dirname, 'public');

// 创建占位符文件
const files = [
  'favicon.ico',
  'apple-touch-icon.png',
  'og-image.png'
];

files.forEach(file => {
  const filePath = path.join(publicDir, file);
  fs.writeFileSync(filePath, transparentPNG);
  console.log(`Created placeholder: ${file}`);
});

console.log('\n⚠️  These are placeholder files.');
console.log('Please use an online tool to convert logo.svg to proper PNG/ICO files:');
console.log('- https://realfavicongenerator.net/');
console.log('- https://www.favicon-generator.org/');
