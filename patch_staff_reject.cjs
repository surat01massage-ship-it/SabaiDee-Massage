const fs = require('fs');
let content = fs.readFileSync('src/components/StaffPanel.tsx', 'utf8');

const targetStr = `  const handleAcceptJob = async (action: 'accept' | 'reject') => {
    if (!incomingBooking || !staff) return;

    if (action === 'reject') {
      // Simulate rejection by removing incoming overlay (timeout logic handles passing to next)
      setIncomingBooking(null);
      onShowToast("ปฏิเสธงานเรียกนวดเรียบร้อยแล้ว", "info");
      return;
    }`;

const replacement = `  const handleAcceptJob = async (action: 'accept' | 'reject') => {
    if (!incomingBooking || !staff) return;

    if (action === 'reject') {
      try {
        await fetch(\`/api/bookings/\${incomingBooking.BookingID}/action\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reject', staffId: staff.StaffID })
        });
        setIncomingBooking(null);
        onShowToast("ปฏิเสธงานเรียกนวดเรียบร้อยแล้ว", "info");
      } catch (e) {
        setIncomingBooking(null);
      }
      return;
    }`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/components/StaffPanel.tsx', content);
