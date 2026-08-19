const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `    if (role === 'Admin') {
      phone = "0812345678";
      pwd = "admin123";
    } else if (role === 'Staff') {
      phone = "0823456789"; // เจ้นง
      pwd = "staff123";
    } else {
      phone = "0898765432"; // คุณสมศักดิ์
      pwd = "customer123";
    }`;

const replacement = `    if (role === 'Admin') {
      phone = "0812345678";
      pwd = "admin123";
    } else if (role === 'Staff') {
      phone = "0823456789"; // เจ้นง
      pwd = "staff123";
    } else {
      phone = "0898765432"; // คุณอภิสิทธิ์
      pwd = "customer123";
    }`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/App.tsx', content);
