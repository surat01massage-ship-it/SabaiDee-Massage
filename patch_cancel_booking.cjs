const fs = require('fs');
let content = fs.readFileSync('src/components/CustomerPanel.tsx', 'utf8');

const targetStr = `              onClick={async () => {
                if (confirm("คุณแน่ใจหรือไม่ที่จะยกเลิกรายการจองนวดในครั้งนี้?")) {
                  try {
                    await fetch(\`/api/bookings/\${activeBooking.BookingID}/action\`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'cancel' })
                    });
                    onShowToast("ยกเลิกรายการเรียกนวดเรียบร้อยแล้ว", "info");
                    setActiveBooking(null);
                  } catch (e) {
                    console.error(e);
                  }
                }
              }}`;

const replacementStr = `              onClick={async () => {
                // Use a simple immediate cancel since window.confirm can be blocked by iframe sandboxes
                try {
                  await fetch(\`/api/bookings/\${activeBooking.BookingID}/action\`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'cancel' })
                  });
                  onShowToast("ยกเลิกรายการเรียกนวดเรียบร้อยแล้ว", "info");
                  setActiveBooking(null);
                } catch (e) {
                  console.error(e);
                }
              }}`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/CustomerPanel.tsx', content);
