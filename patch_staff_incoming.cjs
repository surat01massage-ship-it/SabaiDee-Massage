const fs = require('fs');
let content = fs.readFileSync('src/components/StaffPanel.tsx', 'utf8');

const targetStr = `            <div className="space-y-1">
              <span className="text-[10px] bg-sky-500/20 text-sky-400 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                มีงานใหม่สําหรับคุณ ({countdown} วิ)
              </span>
              <h3 className="text-lg font-black text-slate-100 pt-2">ลูกค้าต้องการจองนวดด่วน!</h3>
              <p className="text-xs text-slate-400 font-semibold">{incomingBooking.CustomerAddress}</p>
            </div>`;

const replacement = `            <div className="space-y-3">
              <span className="text-[10px] bg-sky-500/20 text-sky-400 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                มีงานใหม่สําหรับคุณ ({countdown} วิ)
              </span>
              
              {/* Show Customer Details During Testing */}
              <div className="flex flex-col items-center gap-2 mt-4 bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50">
                <img src={incomingBooking.CustomerProfileImage || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'} className="w-12 h-12 rounded-full border-2 border-sky-500 object-cover" alt="Customer" />
                <div>
                  <h3 className="text-sm font-black text-slate-100">{incomingBooking.CustomerName}</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{incomingBooking.CustomerAddress}</p>
                </div>
              </div>
            </div>`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/components/StaffPanel.tsx', content);
