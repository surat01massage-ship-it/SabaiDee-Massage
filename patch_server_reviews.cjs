const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `  // Toggle availability (ON/OFF)
  app.put('/api/staff/availability', (req, res) => {`;
const replacementStr = `  // Get staff reviews
  app.get('/api/staff/:id/reviews', (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    
    const staffReviews = db.reviews.filter(r => r.StaffID === id);
    // join customer name
    const enrichedReviews = staffReviews.map(r => {
      const customer = db.users.find(u => u.UserID === r.CustomerID);
      return {
        ...r,
        CustomerName: customer ? customer.Name : 'ลูกค้า'
      };
    }).sort((a, b) => new Date(b.CreatedDate).getTime() - new Date(a.CreatedDate).getTime());
    
    res.json(enrichedReviews);
  });

  // Toggle availability (ON/OFF)
  app.put('/api/staff/availability', (req, res) => {`;
content = content.replace(targetStr, replacementStr);
fs.writeFileSync('server.ts', content);
