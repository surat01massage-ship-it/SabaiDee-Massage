const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

const targetStr = `  couponCode: string;
  couponDiscount: number;
}`;

const replacement = `  couponCode: string;
  couponDiscount: number;
  bankName?: string;
  bankAccount?: string;
  bankAccountName?: string;
  qrCodeImage?: string;
}`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/types.ts', content);
