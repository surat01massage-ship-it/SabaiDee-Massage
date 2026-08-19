const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetState = `const [authMode, setAuthMode] = useState<'login' | 'register_customer' | 'register_staff'>('login');`;
const replacementState = `const [authMode, setAuthMode] = useState<'login' | 'register_select' | 'register_customer' | 'register_staff'>('login');`;
content = content.replace(targetState, replacementState);

fs.writeFileSync('src/App.tsx', content);
