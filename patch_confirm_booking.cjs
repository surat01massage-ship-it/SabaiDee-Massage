const fs = require('fs');
let content = fs.readFileSync('src/components/CustomerPanel.tsx', 'utf8');

const targetStr = `      onShowToast("ส่งคำขอจองบริการนวดสำเร็จ! กำลังติดต่อค้นหาพนักงานที่อยู่ใกล้ที่สุด...", "success");
      setActiveBooking(data.booking);
      setActiveTab('booking');
      fetchStaff(); // refresh locations
      setTimeout(() => {`;
const replacementStr = `      onShowToast("ส่งคำขอจองบริการนวดสำเร็จ! กำลังติดต่อค้นหาพนักงานที่อยู่ใกล้ที่สุด...", "success");
      setActiveBooking(data.booking);
      setActiveTab('booking');
      setSelectedStaffProfile(null); // Close the staff profile modal/overlay
      setSelectedStaffForBooking(null); // Reset selection
      fetchStaff(); // refresh locations
      setTimeout(() => {`;
content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/CustomerPanel.tsx', content);
