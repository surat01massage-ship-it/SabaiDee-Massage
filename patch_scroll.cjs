const fs = require('fs');
let content = fs.readFileSync('src/components/CustomerPanel.tsx', 'utf8');

const targetStr = `      onShowToast("ส่งคำขอจองบริการนวดสำเร็จ! กำลังติดต่อค้นหาพนักงานที่อยู่ใกล้ที่สุด...", "success");
      setActiveBooking(data.booking);
      fetchStaff(); // refresh locations`;

const replacementStr = `      onShowToast("ส่งคำขอจองบริการนวดสำเร็จ! กำลังติดต่อค้นหาพนักงานที่อยู่ใกล้ที่สุด...", "success");
      setActiveBooking(data.booking);
      fetchStaff(); // refresh locations
      window.scrollTo({ top: 0, behavior: 'smooth' });`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/CustomerPanel.tsx', content);
