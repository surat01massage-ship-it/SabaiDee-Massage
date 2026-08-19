const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `      }
      return res.json({ message: 'Rejected' });
    }

    if (action === 'accept') {`;

const replacement = `      }
      saveDatabase(db);
      return res.json({ message: 'Rejected' });
    }

    if (action === 'accept') {`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('server.ts', content);
