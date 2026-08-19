const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetTabs = `{/* Standard Login / Registration Tabs Toggle */}
            <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-2xl border border-slate-100 dark:border-slate-850">
              <button
                onClick={() => setAuthMode('login')}
                className={\`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer \${
                  authMode === 'login' ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow' : 'text-slate-400'
                }\`}
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => { setAuthMode('register_customer'); setRegRole('Customer'); }}
                className={\`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer \${
                  authMode === 'register_customer' ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow' : 'text-slate-400'
                }\`}
              >
                🙋 สมัครลูกค้า
              </button>
              <button
                onClick={() => { setAuthMode('register_staff'); setRegRole('Staff'); }}
                className={\`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer \${
                  authMode === 'register_staff' ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow' : 'text-slate-400'
                }\`}
              >
                💆 สมัครพนักงาน
              </button>
            </div>`;
content = content.replace(targetTabs, ``);

const targetLoginFormBottom = `<button
                  type="submit"
                  className="w-full bg-sky-500 hover:bg-sky-600 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  เข้าสู่ระบบสมาชิก
                </button>
              </form>
            ) : (`;

const replacementLoginFormBottom = `<button
                  type="submit"
                  className="w-full bg-sky-500 hover:bg-sky-600 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  เข้าสู่ระบบสมาชิก
                </button>
                <div className="pt-4 text-center">
                  <p className="text-xs font-bold text-slate-500">
                    ยังไม่มีบัญชีใช่หรือไม่?
                  </p>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register_select')}
                    className="w-full mt-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 font-black text-xs py-3.5 rounded-xl transition-colors cursor-pointer"
                  >
                    ลงทะเบียนใช้งาน
                  </button>
                </div>
              </form>
            ) : authMode === 'register_select' ? (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-center font-black text-slate-800 dark:text-white mb-2">เลือกประเภทการสมัครใช้งาน</h3>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => { setAuthMode('register_customer'); setRegRole('Customer'); }}
                    className="flex items-center gap-4 bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-sky-900/20 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl cursor-pointer transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-sky-500 flex items-center justify-center shrink-0 text-xl">
                      🙋
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-black text-slate-800 dark:text-white">สมัครเป็นลูกค้า</span>
                      <span className="block text-[10px] font-bold text-slate-400">สำหรับผู้ที่ต้องการเรียกใช้บริการนวด</span>
                    </div>
                  </button>

                  <button
                    onClick={() => { setAuthMode('register_staff'); setRegRole('Staff'); }}
                    className="flex items-center gap-4 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl cursor-pointer transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500 flex items-center justify-center shrink-0 text-xl">
                      💆
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-black text-slate-800 dark:text-white">สมัครเป็นพนักงานนวด</span>
                      <span className="block text-[10px] font-bold text-slate-400">สำหรับผู้ให้บริการที่ต้องการรับงาน</span>
                    </div>
                  </button>
                </div>
                <button
                  onClick={() => setAuthMode('login')}
                  className="w-full mt-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold text-xs py-3.5 transition-colors cursor-pointer"
                >
                  ย้อนกลับไปหน้าเข้าสู่ระบบ
                </button>
              </div>
            ) : (`;
            
content = content.replace(targetLoginFormBottom, replacementLoginFormBottom);

const targetRegFormBack = `// STANDARD REGISTRATION FORM
              <form onSubmit={handleRegisterSubmit} className="space-y-4">`;

const replacementRegFormBack = `// STANDARD REGISTRATION FORM
              <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <button 
                    type="button" 
                    onClick={() => setAuthMode('register_select')}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <h3 className="font-black text-slate-800 dark:text-white">
                    {authMode === 'register_customer' ? 'สมัครสมาชิกลูกค้า' : 'สมัครสมาชิกพนักงานนวด'}
                  </h3>
                </div>`;

content = content.replace(targetRegFormBack, replacementRegFormBack);

fs.writeFileSync('src/App.tsx', content);
