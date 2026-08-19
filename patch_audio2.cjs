const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `  // Load settings on initial render
  useEffect(() => {
    fetchSettings();
  }, []);`;

const replacement = `  // Load settings on initial render
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
      // Play a tiny silent sound to properly unlock on iOS
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    };
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
  }, []);`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/App.tsx', content);
