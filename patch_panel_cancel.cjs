const fs = require('fs');
let content = fs.readFileSync('src/components/CustomerPanel.tsx', 'utf8');
const target = `        b.CustomerID === currentUser.UserID && 
        b.Status !== 'Completed' && 
        b.Status !== 'Cancel'`;
const replacement = `        b.CustomerID === currentUser.UserID && 
        b.Status !== 'Completed' && 
        b.Status !== 'Cancel' &&
        b.Status !== 'Cancelled'`;
content = content.replace(target, replacement);

const target2 = `        const lastFinished = bookings.filter((b: any) => 
          b.CustomerID === currentUser.UserID && 
          b.BookingID === activeBooking.BookingID
        )[0];
        
        if (lastFinished) {
          if (lastFinished.Status === 'Completed') {`;
const replacement2 = `        const lastFinished = bookings.filter((b: any) => 
          b.CustomerID === currentUser.UserID && 
          b.BookingID === activeBooking.BookingID
        )[0];
        
        if (lastFinished) {
          if (lastFinished.Status === 'Completed') {`;
// Actually, it doesn't notify on Cancelled right now.
// Let's add notification for Cancelled.

fs.writeFileSync('src/components/CustomerPanel.tsx', content);
