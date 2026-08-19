const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStrStart = "{t.type === 'su";
const targetStrEnd = "                  handleSandboxAutofill('Admin');\n                }\n              }}\n              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wide transition-all cursor-pointer ${\n                userRoleMode === 'Admin' && currentUser?.Role === 'Admin'\n                  ? 'bg-sky-500 text-slate-950 font-black shadow-md' \n                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-750'\n              }`}\n            >\n              ⚙️ แอดมินระบบ (Admin)\n            </button>\n          </div>\n        </div>\n      </div>\n\n      {/* MAIN LAYOUT CANVAS */}";
const targetStrEnd2 = "      {/* MAIN LAYOUT CANVAS */}";

let idx1 = content.indexOf(targetStrStart);
let idx2 = content.indexOf(targetStrEnd2);

if (idx1 !== -1 && idx2 !== -1) {
  const replacement = `{t.type === 'success' && <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />}
            {t.type === 'error' && <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 mt-0.5 shrink-0" />}
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      {/* HEADER NAVBAR */}
      <header className={\`border-b \${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-gray-100'
      } sticky top-0 z-40 backdrop-blur-md shadow-xs\`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo / Title brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-sky-500 text-white font-bold text-xl">
              <img src={settings.logo} className="w-full h-full object-cover" alt="Logo" />
            </div>
            <div>
              <span className="font-display font-black text-base text-slate-900 dark:text-white uppercase tracking-tight">{settings.companyName}</span>
              <p className="text-[9px] font-bold text-sky-600 tracking-wider uppercase font-sans">HomeMassage Booking Platform</p>
            </div>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center gap-3">
            
            {/* Audio sound trigger */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                showToast(soundEnabled ? "ปิดเสียงแจ้งเตือนแล้ว" : "เปิดเสียงแจ้งเตือนแล้วค่ะ", "info");
              }}
              className={\`p-2 rounded-xl transition-colors cursor-pointer border \${
                darkMode ? 'hover:bg-slate-800 border-slate-800' : 'hover:bg-slate-100 border-slate-100'
              }\`}
              title="สลับเสียงแจ้งเตือน"
            >
              <Volume2 className={\`w-4 h-4 \${soundEnabled ? 'text-sky-500' : 'text-slate-400'}\`} />
            </button>

            {/* Dark mode trigger */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={\`p-2 rounded-xl transition-colors cursor-pointer border \${
                darkMode ? 'hover:bg-slate-800 border-slate-800' : 'hover:bg-slate-100 border-slate-100'
              }\`}
              title="สลับโหมดหน้าจอ"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Logout button */}
            {currentUser && (
              <button
                onClick={handleLogout}
                className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                ออกจากระบบ
              </button>
            )}
          </div>

        </div>
      </header>

      {/* MAIN LAYOUT CANVAS */}`;
  
  const before = content.substring(0, idx1);
  const after = content.substring(idx2 + targetStrEnd2.length);
  fs.writeFileSync('src/App.tsx', before + replacement + after);
  console.log("Success");
} else {
  console.log("Indices not found", idx1, idx2);
}
