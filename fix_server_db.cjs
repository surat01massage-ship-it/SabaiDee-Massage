const fs = require('fs');
let content = fs.readFileSync('server/db.ts', 'utf8');

const targetStr = `  couponDiscount: 50
};`;

const replacement = `  couponDiscount: 50,
  bankName: "ธนาคารกสิกรไทย",
  bankAccount: "123-4-56789-0",
  bankAccountName: "บจก. สบายดี มาสสาจ",
  qrCodeImage: "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
};`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('server/db.ts', content);
