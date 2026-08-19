const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `  app.put('/api/users/:id/role', (req, res) => {`;

const replacement = `  app.put('/api/users/:id', (req, res) => {
    const db = getDatabase();
    const user = db.users.find(u => u.UserID === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const { name, phone, password, role } = req.body;
    if (name) user.Name = name;
    if (phone) user.Phone = phone;
    if (password) user.PasswordHash = password;
    if (role && ['Customer', 'Staff', 'Admin'].includes(role)) {
      user.Role = role;
    }
    
    saveDatabase(db);
    res.json({ success: true, user });
  });

  app.put('/api/users/:id/role', (req, res) => {`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('server.ts', content);
