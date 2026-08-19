const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content.replace(/emerald-/g, 'sky-');
  newContent = newContent.replace(/text-emerald/g, 'text-sky');
  newContent = newContent.replace(/bg-emerald/g, 'bg-sky');
  newContent = newContent.replace(/border-emerald/g, 'border-sky');
  newContent = newContent.replace(/ring-emerald/g, 'ring-sky');
  newContent = newContent.replace(/shadow-emerald/g, 'shadow-sky');
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.html') || filePath.endsWith('.ts')) {
      replaceInFile(filePath);
    }
  }
}

walkDir('./src');
walkDir('./index.html');
console.log('Done replacing colors.');
