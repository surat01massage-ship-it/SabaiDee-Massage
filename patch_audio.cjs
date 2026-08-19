const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr1 = `  // Play Grab-style Synthesizer Ding-Chime Audio chime
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;`;

const replacement1 = `  // Play Grab-style Synthesizer Ding-Chime Audio chime
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;`;

const targetStr2 = `export default function App() {`;

const replacement2 = `let globalAudioCtx: any = null;
const getAudioContext = () => {
  if (!globalAudioCtx) {
    globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return globalAudioCtx;
};

export default function App() {`;

const targetStr3 = `  // Global database settings loader
  useEffect(() => {
    fetchSettings();
  }, []);`;

const replacement3 = `  // Global database settings loader
  useEffect(() => {
    fetchSettings();
  }, []);

  // Unlock Audio on first interaction for mobile browsers
  useEffect(() => {
    const unlockAudio = () => {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    };
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
  }, []);`;

content = content.replace(targetStr1, replacement1);
content = content.replace(targetStr2, replacement2);
content = content.replace(targetStr3, replacement3);

fs.writeFileSync('src/App.tsx', content);
