const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `          booking.Status = 'Cancel';
          booking.CancellationReason = 'พนักงานทั้งหมดปฏิเสธงาน / ไม่ว่างรับสาย';
          booking.StaffID = null;`;

const replacement = `          booking.Status = 'Cancel';
          booking.CancellationReason = 'พนักงานทั้งหมดปฏิเสธงาน / ไม่ว่างรับสาย';
          booking.StaffID = 'none';`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('server.ts', content);
