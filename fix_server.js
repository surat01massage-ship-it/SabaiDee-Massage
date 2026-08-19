const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `
    // Top staff
    const topStaff = db.staff`;

const replacement = `
    // Sales by month (all time grouped by YYYY-MM)
    const salesByMonth = {};
    db.bookings
      .filter(b => b.Status === 'Completed')
      .forEach(b => {
        const monthStr = b.BookingDate.substring(0, 7);
        salesByMonth[monthStr] = (salesByMonth[monthStr] || 0) + b.TotalPrice;
      });

    // Top staff
    const topStaff = db.staff`;

content = content.replace(targetStr, replacement);

const targetStr2 = `      salesByDay,
      topStaff
    });`;

const replacement2 = `      salesByDay,
      salesByMonth,
      topStaff
    });`;

content = content.replace(targetStr2, replacement2);
fs.writeFileSync('server.ts', content);
