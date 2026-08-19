const fs = require('fs');
let content = fs.readFileSync('src/components/CustomerPanel.tsx', 'utf8');

const targetStr = `      onShowToast("ส่งคำขอจองบริการนวดสำเร็จ! กำลังติดต่อค้นหาพนักงานที่อยู่ใกล้ที่สุด...", "success");
      setActiveBooking(data.booking);
      fetchStaff(); // refresh locations
      window.scrollTo({ top: 0, behavior: 'smooth' });`;

const replacementStr = `      onShowToast("ส่งคำขอจองบริการนวดสำเร็จ! กำลังติดต่อค้นหาพนักงานที่อยู่ใกล้ที่สุด...", "success");
      setActiveBooking(data.booking);
      fetchStaff(); // refresh locations
      setTimeout(() => {
        const root = document.getElementById('customer-view-root');
        if (root) {
          root.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/CustomerPanel.tsx', content);
