const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `    const { name, phone, password, role } = req.body;
    if (name) user.Name = name;
    if (phone) user.Phone = phone;
    if (password) user.PasswordHash = password;
    if (role && ['Customer', 'Staff', 'Admin'].includes(role)) {
      user.Role = role;
    }`;

const replacement = `    const { name, phone, password, role, profileImage } = req.body;
    if (name !== undefined) user.Name = name;
    if (phone !== undefined) user.Phone = phone;
    if (password) user.PasswordHash = password;
    if (role && ['Customer', 'Staff', 'Admin'].includes(role)) {
      user.Role = role;
    }
    if (profileImage !== undefined) user.ProfileImage = profileImage;`;

content = content.replace(target, replacement);
fs.writeFileSync('server.ts', content);
