const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace("booking.Status = 'Cancelled';", "booking.Status = 'Cancel';");
fs.writeFileSync('server.ts', content);
