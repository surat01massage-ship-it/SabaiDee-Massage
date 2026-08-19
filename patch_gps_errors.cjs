const fs = require('fs');

// Patch CustomerPanel.tsx
let customerContent = fs.readFileSync('src/components/CustomerPanel.tsx', 'utf8');
customerContent = customerContent.replace(
  'console.error("Auto GPS error:", error);',
  'console.warn("Auto GPS error (can be ignored in preview):", error.message);'
);
fs.writeFileSync('src/components/CustomerPanel.tsx', customerContent);

// Patch StaffPanel.tsx
let staffContent = fs.readFileSync('src/components/StaffPanel.tsx', 'utf8');
staffContent = staffContent.replace(
  'console.error("Staff GPS init error:", err)',
  'console.warn("Staff GPS init error (can be ignored in preview):", err.message)'
);
staffContent = staffContent.replace(
  'console.error("Staff GPS poll error:", err)',
  'console.warn("Staff GPS poll error (can be ignored in preview):", err.message)'
);
fs.writeFileSync('src/components/StaffPanel.tsx', staffContent);
