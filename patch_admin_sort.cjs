const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const targetStr = `  const fetchAllUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setAllUsers(data);
    } catch (e) {
      console.error(e);
    }
  };`;

const replacement = `  const fetchAllUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      // Sort users so Customers appear first during testing
      const sortedData = data.sort((a: any, b: any) => {
        const roleOrder: any = { 'Customer': 1, 'Staff': 2, 'Admin': 3 };
        return (roleOrder[a.Role] || 99) - (roleOrder[b.Role] || 99);
      });
      setAllUsers(sortedData);
    } catch (e) {
      console.error(e);
    }
  };`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/components/AdminPanel.tsx', content);
