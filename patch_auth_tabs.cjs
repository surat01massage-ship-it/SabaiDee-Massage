const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetState = `const [isRegistering, setIsRegistering] = useState(false);`;
const replacementState = `const [authMode, setAuthMode] = useState<'login' | 'register_customer' | 'register_staff'>('login');`;
content = content.replace(targetState, replacementState);

const targetTabs = `            {/* Standard Login / Registration Tabs Toggle */}
            <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-2xl border border-slate-100 dark:border-slate-850">
              <button
                onClick={() => setIsRegistering(false)}
                className={\`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer \${
                  !isRegistering ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow' : 'text-slate-400'
                }\`}
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => setIsRegistering(true)}
                className={\`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer \${
                  isRegistering ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow' : 'text-slate-400'
                }\`}
              >
                สมัครผู้ใช้งานใหม่
              </button>
            </div>`;
            
const replacementTabs = `            {/* Standard Login / Registration Tabs Toggle */}
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
content = content.replace(targetTabs, replacementTabs);

const targetFastLogin = `            {/* FAST LOGIN PRESET SHORTCUT SUGGESTION */}
            {!isRegistering && (`;
const replacementFastLogin = `            {/* FAST LOGIN PRESET SHORTCUT SUGGESTION */}
            {authMode === 'login' && (`;
content = content.replace(targetFastLogin, replacementFastLogin);

const targetLoginForm = `            {/* STANDARD LOGIN FORM */}
            {!isRegistering ? (`;
const replacementLoginForm = `            {/* STANDARD LOGIN FORM */}
            {authMode === 'login' ? (`;
content = content.replace(targetLoginForm, replacementLoginForm);

const targetInnerToggle = `                                {/* Role Selection Menu */}
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
                </div>`;
const replacementInnerToggle = ``;
content = content.replace(targetInnerToggle, replacementInnerToggle);

fs.writeFileSync('src/App.tsx', content);
