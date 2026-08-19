const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetFormStart = `              // STANDARD REGISTRATION FORM
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1">`;

const replacementFormStart = `              // STANDARD REGISTRATION FORM
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                
                {/* Role Selection Menu */}
                <div className="flex bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl mb-4">
                  <button
                    type="button"
                    onClick={() => setRegRole('Customer')}
                    className={\`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 \${
                      regRole === 'Customer' ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow' : 'text-slate-400'
                    }\`}
                  >
                    🙋 สมัครลูกค้า
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('Staff')}
                    className={\`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 \${
                      regRole === 'Staff' ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow' : 'text-slate-400'
                    }\`}
                  >
                    💆 สมัครพนักงาน
                  </button>
                </div>

                <div className="space-y-1">`;

content = content.replace(targetFormStart, replacementFormStart);

const targetSelect = `                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ประเภทผู้ใช้บริการ</label>
                  <select
                    value={regRole}
                    onChange={(e: any) => setRegRole(e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-950 focus:outline-none cursor-pointer"
                  >
                    <option value="Customer">🙋 ลูกค้าทั่วไป (Customer)</option>
                    <option value="Staff">💆 พนักงานนวดคอยยื่นแก้อาการ (Staff)</option>
                  </select>
                </div>`;

content = content.replace(targetSelect, '');

fs.writeFileSync('src/App.tsx', content);
