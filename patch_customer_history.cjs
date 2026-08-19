const fs = require('fs');
let content = fs.readFileSync('src/components/CustomerPanel.tsx', 'utf8');

const targetState = `  const [activeTab, setActiveTab] = useState<'home' | 'booking'>('home');`;
const replacementState = `  const [activeTab, setActiveTab] = useState<'home' | 'booking' | 'history'>('home');
  const [historyBookings, setHistoryBookings] = useState<any[]>([]);`;
content = content.replace(targetState, replacementState);

const targetFetch = `      const latest = customerBookings[customerBookings.length - 1] || null;`;
const replacementFetch = `      const latest = customerBookings[customerBookings.length - 1] || null;
      
      const allHistory = bookings.filter((b: any) => 
        b.CustomerID === currentUser.UserID && 
        (b.Status === 'Completed' || b.Status === 'Cancel' || b.Status === 'Cancelled')
      ).sort((a: any, b: any) => new Date(b.CreatedDate).getTime() - new Date(a.CreatedDate).getTime());
      
      setHistoryBookings(allHistory);`;
content = content.replace(targetFetch, replacementFetch);

const targetTabs = `        <button
          onClick={() => setActiveTab('booking')}
          className={\`flex-1 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer relative \${
            activeTab === 'booking' 
              ? 'bg-sky-500 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-50'
          }\`}
        >
          รายการจองของฉัน
          {activeBooking && (
            <span className="absolute top-1.5 right-4 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>`;
const replacementTabs = `        <button
          onClick={() => setActiveTab('booking')}
          className={\`flex-1 text-[10px] sm:text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer relative \${
            activeTab === 'booking' 
              ? 'bg-sky-500 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-50'
          }\`}
        >
          กำลังจอง
          {activeBooking && (
            <span className="absolute top-1.5 right-4 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={\`flex-1 text-[10px] sm:text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer \${
            activeTab === 'history' 
              ? 'bg-sky-500 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-50'
          }\`}
        >
          ประวัติ
        </button>
      </div>`;
content = content.replace(targetTabs, replacementTabs);

// Add history view at the end before </div> );
const historyRender = `      {/* History view */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-800">ประวัติการจอง</h2>
          
          {historyBookings.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center shadow-sm">
              <span className="text-3xl mb-3 block">🕰️</span>
              <p className="text-sm font-bold text-slate-500">ยังไม่มีประวัติการจอง</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyBookings.map((b, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">#ID: {b.BookingID}</span>
                      <h4 className="font-bold text-slate-800">{b.ServiceName}</h4>
                    </div>
                    <span className={\`text-[10px] font-bold px-2.5 py-1 rounded-full \${
                      b.Status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }\`}>
                      {b.Status === 'Completed' ? 'สำเร็จ' : 'ยกเลิก'}
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-500 space-y-1 mb-3">
                    <p>วันที่: {b.BookingDate} เวลา {b.BookingTime}</p>
                    {b.StaffID !== 'none' && (
                      <p>พนักงาน: พี่{b.StaffNickname}</p>
                    )}
                    <p className="font-semibold text-sky-600 mt-2">ยอดรวม: ฿{b.TotalPrice}</p>
                  </div>
                  
                  {b.CancellationReason && (
                    <div className="bg-rose-50 border border-rose-100 rounded-lg p-2.5 text-[10px] text-rose-600 font-medium">
                      หมายเหตุ: {b.CancellationReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}`;

content = content.replace(`    </div>\n  );\n}`, historyRender + `\n    </div>\n  );\n}`);

// Oh wait, one fix for the "activeTab === 'home'" button text
const tabHomeStr = `        <button
          onClick={() => setActiveTab('home')}
          className={\`flex-1 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer \${
            activeTab === 'home' 
              ? 'bg-sky-500 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-50'
          }\`}
        >
          หน้าแรก (จองนวด)
        </button>`;
const newTabHomeStr = `        <button
          onClick={() => setActiveTab('home')}
          className={\`flex-1 text-[10px] sm:text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer \${
            activeTab === 'home' 
              ? 'bg-sky-500 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-50'
          }\`}
        >
          จองนวด
        </button>`;
content = content.replace(tabHomeStr, newTabHomeStr);

fs.writeFileSync('src/components/CustomerPanel.tsx', content);
