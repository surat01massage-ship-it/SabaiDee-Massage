const fs = require('fs');
let content = fs.readFileSync('src/components/CustomerPanel.tsx', 'utf8');
const target = `          } else if (lastFinished.Status === 'Cancel') {`;
const replacement = `          } else if (lastFinished.Status === 'Cancel' || lastFinished.Status === 'Cancelled') {`;
content = content.replace(target, replacement);
fs.writeFileSync('src/components/CustomerPanel.tsx', content);
