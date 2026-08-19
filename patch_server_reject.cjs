const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `    if (action === 'accept') {
      const staff = db.staff.find(s => s.StaffID === staffId);`;

const replacement = `    if (action === 'reject') {
      if (booking.Status === 'Waiting' && booking.offeredQueue && booking.offerExpireTime) {
        booking.currentOfferIndex = (booking.currentOfferIndex || 0) + 1;
        
        if (booking.currentOfferIndex < booking.offeredQueue.length) {
          const nextStaffId = booking.offeredQueue[booking.currentOfferIndex];
          booking.StaffID = nextStaffId;
          booking.offerExpireTime = new Date(Date.now() + 30 * 1000).toISOString();
          
          const staffObj = db.staff.find(s => s.StaffID === nextStaffId);
          if (staffObj) {
            db.notifications.push({
              NotificationID: generateId('N'),
              UserID: staffObj.UserID,
              Title: "🔔 ได้รับข้อเสนองานใหม่ (ส่งต่อ)",
              Detail: \`งานบริการ \${service?.ServiceName || 'นวด'} ถูกส่งต่อมายังคุณเนื่องจากพนักงานก่อนหน้าปฏิเสธรับงาน กรุณาตอบรับค่ะ\`,
              ReadStatus: 'Unread',
              CreatedDate: new Date().toISOString()
            });
          }
        } else {
          booking.Status = 'Cancelled';
          booking.CancellationReason = 'พนักงานทั้งหมดปฏิเสธงาน / ไม่ว่างรับสาย';
          booking.StaffID = null;
          if (customerUser) {
            db.notifications.push({
              NotificationID: generateId('N'),
              UserID: customerUser.UserID,
              Title: "❌ ไม่มีพนักงานตอบรับงาน",
              Detail: "ขออภัยค่ะ ขณะนี้พนักงานคิวทั้งหมดไม่สะดวกให้บริการ กรุณาลองเรียกใหม่อีกครั้งในภายหลัง",
              ReadStatus: 'Unread',
              CreatedDate: new Date().toISOString()
            });
          }
        }
      }
      return res.json({ message: 'Rejected' });
    }

    if (action === 'accept') {
      const staff = db.staff.find(s => s.StaffID === staffId);`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('server.ts', content);
