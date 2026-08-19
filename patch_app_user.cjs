const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<CustomerPanel 
                currentUser={currentUser}
                settings={settings}
                onShowToast={showToast}
                onPlayNotificationSound={playChime}
              />`;
const replacement = `<CustomerPanel 
                currentUser={currentUser}
                settings={settings}
                onShowToast={showToast}
                onPlayNotificationSound={playChime}
                onUpdateUser={setCurrentUser}
              />`;

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content);
