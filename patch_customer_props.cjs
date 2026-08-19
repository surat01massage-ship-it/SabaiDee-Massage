const fs = require('fs');
let content = fs.readFileSync('src/components/CustomerPanel.tsx', 'utf8');

const targetProps = `interface CustomerPanelProps {
  currentUser: User | null;
  settings: AppSettings;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onPlayNotificationSound?: () => void;
}

export default function CustomerPanel({
  currentUser,
  settings,
  onShowToast,
  onPlayNotificationSound
}: CustomerPanelProps) {`;

const replacementProps = `interface CustomerPanelProps {
  currentUser: User | null;
  settings: AppSettings;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onPlayNotificationSound?: () => void;
  onUpdateUser?: (user: User) => void;
}

export default function CustomerPanel({
  currentUser,
  settings,
  onShowToast,
  onPlayNotificationSound,
  onUpdateUser
}: CustomerPanelProps) {`;

content = content.replace(targetProps, replacementProps);
fs.writeFileSync('src/components/CustomerPanel.tsx', content);
