const fs = require('fs');
let content = fs.readFileSync('src/components/StaffPanel.tsx', 'utf8');

const targetStr = `  // Sound/countdown ticking
  useEffect(() => {
    if (!incomingBooking) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Expiration triggered automatically on next matching tick, so just clear here
          setIncomingBooking(null);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingBooking]);`;

const replacement = `  // Sound/countdown ticking
  useEffect(() => {
    if (!incomingBooking) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Expiration triggered automatically on next matching tick, so just clear here
          setIncomingBooking(null);
          return 30;
        }
        // Play notification sound continuously while waiting
        if (prev % 2 === 0 && onPlayNotificationSound) {
           onPlayNotificationSound();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingBooking, onPlayNotificationSound]);`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/components/StaffPanel.tsx', content);
