const fs = require('fs');
let content = fs.readFileSync('src/components/CustomerPanel.tsx', 'utf8');

const historyEndTarget = `        </div>
      )}
    </div>
  );
}`;

const profileRender = `        </div>
      )}

      {/* Profile view */}
      {activeTab === 'profile' && currentUser && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-lg font-black text-slate-800">โปรไฟล์ของคุณ</h2>
          
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col items-center">
            <img 
              src={currentUser.ProfileImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"} 
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-sky-100 shadow-sm mb-4"
            />
            <h3 className="text-xl font-black text-slate-900">{currentUser.Name}</h3>
            <span className="bg-sky-100 text-sky-700 text-xs font-bold px-3 py-1 rounded-full mt-2">ลูกค้าสมาชิก</span>
            
            <div className="w-full mt-8 space-y-4">
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-sky-500" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">เบอร์ติดต่อ</span>
                  <span className="text-sm font-bold text-slate-700">{currentUser.Phone}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => {
                window.location.reload();
              }}
              className="w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold py-3.5 rounded-xl transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      )}

    </div>
  );
}`;

if (content.includes(historyEndTarget)) {
  content = content.replace(historyEndTarget, profileRender);
  fs.writeFileSync('src/components/CustomerPanel.tsx', content);
  console.log('Replaced correctly');
} else {
  console.log('Target string not found');
}
