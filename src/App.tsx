import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Shield, User as UserIcon, Briefcase, Eye, ChevronRight, 
  MapPin, Phone, Lock, Moon, Sun, Bell, Volume2, ShieldAlert, CheckCircle, Info
} from 'lucide-react';
import { User, Staff, AppSettings } from './types';
import CustomerPanel from './components/CustomerPanel';
import StaffPanel from './components/StaffPanel';
import AdminPanel from './components/AdminPanel';

let globalAudioCtx: any = null;
const getAudioContext = () => {
  if (!globalAudioCtx) {
    globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return globalAudioCtx;
};

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  // Sound enabled state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  
  // Tab/Panel selector
  const [userRoleMode, setUserRoleMode] = useState<'Customer' | 'Staff' | 'Admin'>('Customer');

  // Login Form input states
  const [phoneInput, setPhoneInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authMode, setAuthMode] = useState<'login' | 'register_select' | 'register_customer' | 'register_staff'>('login');

  // Registration Form states
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<'Customer' | 'Staff'>('Customer');
  const [regAge, setRegAge] = useState(25);
  const [regWeight, setRegWeight] = useState(50);
  const [regHeight, setRegHeight] = useState(160);
  const [regRegisteredAddress, setRegRegisteredAddress] = useState("");
  const [regExperience, setRegExperience] = useState(2);
  const [regGender, setRegGender] = useState<'Female' | 'Male' | 'Other'>('Female');

  // Platform global Settings loaded from server
  const [settings, setSettings] = useState<AppSettings>({
    companyName: "SabaiDee Massage",
    logo: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=120&auto=format&fit=crop&q=60",
    themeColor: "#00B14F",
    travelFeePerKm: 15,
    travelFeeTiers: [
      { minKm: 0, maxKm: 3, fee: 0 },
      { minKm: 3, maxKm: 10, fee: 150 },
      { minKm: 10, maxKm: 15, fee: 200 }
    ],
    commissionRate: 15,
    minCredit: 200,
    searchRadius: 15,
    systemOpen: 'ON',
    contactPhone: "081-234-5678",
    lineOA: "@sabaideemassage",
    facebook: "SabaiDee Home Massage",
    businessHours: "09:00 - 22:00",
    bannerText: "✨ โปรโมชั่นพิเศษ! ลดค่าเดินทาง 50% สำหรับการจองครั้งแรก ✨",
    promotionText: "จองนวดอโรมาวันนี้ รับสิทธิ์นวดคอบ่าไหล่ฟรี 15 นาที!",
    couponCode: "SABAIDEE99",
    couponDiscount: 50,
    bankName: "ธนาคารกสิกรไทย",
    bankAccount: "123-4-56789-0",
    bankAccountName: "บจก. สบายดี มาสสาจ",
    qrCodeImage: "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
  });

  // Floating Toasts alerts state list
  const [toasts, setToasts] = useState<Array<{ id: number; msg: string; type: 'success' | 'error' | 'info' }>>([]);

  // Load settings on initial render
  useEffect(() => {
    fetchSettings();
  }, []);

  // Unlock Audio on first interaction for mobile browsers
  useEffect(() => {
    const unlockAudio = () => {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      // Play a tiny silent sound to properly unlock on iOS
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    };
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Play Grab-style Synthesizer Ding-Chime Audio chime
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;
      
      // High chime
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Higher second chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.1); // A5
      gain2.gain.setValueAtTime(0.12, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.4);
    } catch (e) {
      console.warn("Audio block by autoplay policies", e);
    }
  };

  // Toast notices display trigger
  const showToast = (msg: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Sandbox Fast Login Autofill shortcuts
  const handleSandboxAutofill = async (role: 'Customer' | 'Staff' | 'Admin') => {
    let phone = "";
    let pwd = "";

    if (role === 'Admin') {
      phone = "0812345678";
      pwd = "admin123";
    } else if (role === 'Staff') {
      phone = "0823456789"; // เจ้นง
      pwd = "staff123";
    } else {
      phone = "0898765432"; // คุณอภิสิทธิ์
      pwd = "customer123";
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password: pwd })
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('เซิร์ฟเวอร์กำลังเชื่อมต่อหรือเริ่มต้นระบบใหม่ กรุณารอสักครู่แล้วลองอีกครั้งค่ะ');
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ไม่สามารถเข้าสู่ระบบได้');

      setCurrentUser(data.user);
      setCurrentStaff(data.staff);
      setUserRoleMode(data.user.Role);
      showToast(`เข้าสู่ระบบในฐานะ ${data.user.Name} (${data.user.Role}) สำเร็จ!`, "success");
      playChime();
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  // Standard Login Submit handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput || !passwordInput) {
      showToast("กรุณากรอกเบอร์โทรศัพท์และรหัสผ่านด้วยค่ะ", "error");
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput, password: passwordInput })
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('เซิร์ฟเวอร์กำลังเชื่อมต่อหรือเริ่มต้นระบบใหม่ กรุณารอสักครู่แล้วลองอีกครั้งค่ะ');
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง');

      setCurrentUser(data.user);
      setCurrentStaff(data.staff);
      setUserRoleMode(data.user.Role);
      showToast(`ยินดีต้อนรับกลับมาค่ะ คุณ${data.user.Name}`, "success");
      playChime();

      // Clear forms
      setPhoneInput("");
      setPasswordInput("");
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  // Standard Registration submit handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regPhone || !regPassword) {
      showToast("กรุณากรอกฟิลด์ข้อมูลสำคัญให้ครบถ้วนด้วยค่ะ", "error");
      return;
    }

    const currentRole: 'Customer' | 'Staff' = authMode === 'register_staff' ? 'Staff' : 'Customer';

    try {
      const payload = {
        name: regName,
        phone: regPhone,
        password: regPassword,
        role: currentRole,
        profileImage: currentRole === 'Staff' 
          ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150" 
          : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        staffInfo: currentRole === 'Staff' ? {
          nickname: regName.split(" ")[0],
          age: regAge,
          weight: regWeight,
          height: regHeight,
          registeredAddress: regRegisteredAddress,
          gender: regGender,
          experience: regExperience,
          description: "พร้อมให้บริการสปานวดเพื่อสุขภาพและการผ่อนคลายเต็มรูปแบบ"
        } : undefined
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('เซิร์ฟเวอร์กำลังเชื่อมต่อหรือเริ่มต้นระบบใหม่ กรุณารอสักครู่แล้วลองอีกครั้งค่ะ');
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'สมัครสมาชิกไม่สำเร็จ');

      showToast(currentRole === 'Staff' 
        ? "สมัครพนักงานนวดเรียบร้อยแล้ว! กรุณาเข้าสู่ระบบเพื่อตรวจสอบสถานะการอนุมัติค่ะ" 
        : "สมัครสมาชิกลูกค้าสำเร็จเรียบร้อย! กรุณาเข้าสู่ระบบเพื่อเริ่มใช้งาน", "success");
      setAuthMode('login');
      setPhoneInput(regPhone);
      setPasswordInput(regPassword);
      // Reset form
      setRegName("");
      setRegRegisteredAddress("");
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentStaff(null);
    setUserRoleMode('Customer');
    showToast("ออกจากระบบในเบราว์เซอร์สำเร็จ", "info");
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans flex flex-col ${
      darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`} id="main-app-container">
      
      {/* GLOBAL TOAST NOTIFICATION CONTAINER OVERLAY */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-2xl shadow-xl flex items-start gap-3 border text-xs font-semibold leading-normal animate-slide-in pointer-events-auto ${
              t.type === 'success' ? 'bg-sky-500 border-sky-400 text-slate-950 font-bold' :
              t.type === 'error' ? 'bg-rose-500 border-rose-400 text-white' :
              'bg-slate-900 border-slate-800 text-sky-400'
            }`}
          >
            {t.type === 'success' && <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />}
            {t.type === 'error' && <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 mt-0.5 shrink-0" />}
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      {/* HEADER NAVBAR */}
      <header className={`border-b ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-slate-200/80'
      } sticky top-0 z-40 backdrop-blur-md shadow-xs`}>
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
              className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                darkMode ? 'hover:bg-slate-800 border-slate-800' : 'hover:bg-slate-100 border-slate-200'
              }`}
              title="สลับเสียงแจ้งเตือน"
            >
              <Volume2 className={`w-4 h-4 ${soundEnabled ? 'text-sky-500' : 'text-slate-400'}`} />
            </button>

            {/* Dark mode trigger */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                darkMode ? 'hover:bg-slate-800 border-slate-800' : 'hover:bg-slate-100 border-slate-200'
              }`}
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

      {/* MAIN LAYOUT CANVAS */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-1">
        
        {/* CASE 1: USER IS NOT LOGGED IN IN THE SESSION (LOGIN PANEL) */}
        {!currentUser ? (
          <div className="max-w-md mx-auto bg-white text-slate-800 border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/60 space-y-6 animate-scale-up text-left">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto text-sky-500 font-black">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900 pt-2">เข้าสู่ระบบ SabaiDee Massage</h2>
              <p className="text-xs text-slate-500 font-semibold leading-normal">
                แพลตฟอร์มเรียกบริการหมอนวดมืออาชีพถึงบ้าน สะดวก ปลอดภัย ตลอด 24 ชม.
              </p>
            </div>

            {/* FAST LOGIN PRESET SHORTCUT SUGGESTION */}
            {authMode === 'login' && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block text-center">ทดสอบระบบด่วน (เลือกสิทธิ์การใช้งาน)</span>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSandboxAutofill('Customer')}
                    className="flex items-center gap-3 bg-white hover:bg-sky-50/50 border border-slate-200 p-3 rounded-2xl cursor-pointer transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      🙋
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-bold text-slate-800 group-hover:text-sky-600 transition-colors">สำหรับลูกค้า (Customer)</span>
                      <span className="block text-[10px] font-semibold text-slate-500">เข้าสู่ระบบเพื่อเรียกใช้งานนวด</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSandboxAutofill('Staff')}
                    className="flex items-center gap-3 bg-white hover:bg-emerald-50/50 border border-slate-200 p-3 rounded-2xl cursor-pointer transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      💆
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">สำหรับผู้ให้บริการ (Staff)</span>
                      <span className="block text-[10px] font-semibold text-slate-500">เข้าสู่ระบบเพื่อรับงานและจัดการรายได้</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSandboxAutofill('Admin')}
                    className="flex items-center gap-3 bg-white hover:bg-indigo-50/50 border border-slate-200 p-3 rounded-2xl cursor-pointer transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      ⚙️
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">สำหรับผู้ดูแลระบบ (Admin)</span>
                      <span className="block text-[10px] font-semibold text-slate-500">จัดการข้อมูลผู้ใช้และอนุมัติรายการ</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* STANDARD LOGIN FORM */}
            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">เบอร์โทรศัพท์มือถือ</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="เช่น 0823456789"
                      required
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl py-3 pl-10 pr-4 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">รหัสผ่านบัญชี</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl py-3 pl-10 pr-4 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-sky-500 hover:bg-sky-600 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  เข้าสู่ระบบสมาชิก
                </button>
                <div className="pt-4 border-t border-slate-100 space-y-2 text-center">
                  <p className="text-[11px] font-bold text-slate-500">
                    ยังไม่มีบัญชีใช่หรือไม่? เลือกสมัครสมาชิก
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register_customer');
                        setRegRole('Customer');
                      }}
                      className="w-full bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-extrabold text-xs py-3 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      🙋 สมัครสมาชิกลูกค้า
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register_staff');
                        setRegRole('Staff');
                      }}
                      className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-extrabold text-xs py-3 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      💆 สมัครพนักงานนวด
                    </button>
                  </div>
                </div>
              </form>
            ) : authMode === 'register_select' ? (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-center font-black text-slate-900 mb-2">เลือกประเภทการสมัครสมาชิก</h3>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register_customer'); setRegRole('Customer'); }}
                    className="flex items-center gap-4 bg-white hover:bg-sky-50/50 border border-slate-200 p-4 rounded-2xl cursor-pointer transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 text-xl">
                      🙋
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-black text-slate-900">สมัครสมาชิกลูกค้า</span>
                      <span className="block text-[10px] font-bold text-slate-500">สำหรับผู้ที่ต้องการเรียกใช้บริการนวดถึงบ้าน</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setAuthMode('register_staff'); setRegRole('Staff'); }}
                    className="flex items-center gap-4 bg-white hover:bg-emerald-50/50 border border-slate-200 p-4 rounded-2xl cursor-pointer transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xl">
                      💆
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-black text-slate-900">สมัครสมาชิกพนักงานนวด</span>
                      <span className="block text-[10px] font-bold text-slate-500">สำหรับผู้ให้บริการหมอนวดมืออาชีพที่ต้องการรับงาน</span>
                    </div>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="w-full mt-2 text-slate-500 hover:text-slate-700 font-bold text-xs py-3.5 transition-colors cursor-pointer"
                >
                  ย้อนกลับไปหน้าเข้าสู่ระบบ
                </button>
              </div>
            ) : authMode === 'register_customer' ? (
              // 🙋 DEDICATED CUSTOMER REGISTRATION FORM (NO STAFF TOGGLE)
              <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setAuthMode('login')}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                    title="ย้อนกลับ"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <div>
                    <h3 className="font-black text-base text-slate-900 flex items-center gap-1.5">
                      <span>🙋</span> สมัครสมาชิกลูกค้า
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-500">สร้างบัญชีสำหรับเรียกบริการหมอนวดมืออาชีพถึงบ้าน</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ชื่อ-นามสกุลจริง</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="เช่น นาย สมคิด รักสปา"
                    required
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">เบอร์โทรศัพท์มือถือ</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="เช่น 08xxxxxxxx"
                    required
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ตั้งรหัสผ่าน</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="อย่างน้อย 4 ตัวอักษรขึ้นไป"
                    required
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-sky-500 hover:bg-sky-600 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  🙋 ยืนยันสมัครสมาชิกลูกค้า
                </button>

                <div className="pt-2 text-center space-y-1.5">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register_staff'); setRegRole('Staff'); }}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer block w-full"
                  >
                    ต้องการสมัครเป็นพนักงานนวด? คลิกที่นี่
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer block w-full"
                  >
                    มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
                  </button>
                </div>
              </form>
            ) : (
              // 💆 DEDICATED STAFF REGISTRATION FORM (NO CUSTOMER TOGGLE)
              <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setAuthMode('login')}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                    title="ย้อนกลับ"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <div>
                    <h3 className="font-black text-base text-slate-900 flex items-center gap-1.5">
                      <span>💆</span> สมัครสมาชิกพนักงานนวด
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-500">ร่วมงานเป็นหมอนวดมืออาชีพกับ SabaiDee Massage</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ชื่อ-นามสกุลจริง</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="เช่น น.ส. สมคิด บุญชู"
                    required
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">เบอร์โทรศัพท์สมัคร</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="เช่น 08xxxxxxxx"
                    required
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ตั้งรหัสผ่าน</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="อย่างน้อย 4 ตัวอักษรขึ้นไป"
                    required
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Additional Staff Registration Details */}
                <div className="space-y-4 border-t border-slate-100 pt-4 animate-fade-in">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">อายุ (ปี)</label>
                      <input
                        type="number"
                        value={regAge}
                        onChange={(e) => setRegAge(parseInt(e.target.value) || 20)}
                        required
                        min={18}
                        max={70}
                        className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-white text-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">น้ำหนัก (กก.)</label>
                      <input
                        type="number"
                        value={regWeight}
                        onChange={(e) => setRegWeight(parseInt(e.target.value) || 50)}
                        required
                        min={35}
                        max={150}
                        className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-white text-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ส่วนสูง (ซม.)</label>
                      <input
                        type="number"
                        value={regHeight}
                        onChange={(e) => setRegHeight(parseInt(e.target.value) || 160)}
                        required
                        min={120}
                        max={220}
                        className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ที่อยู่ตามทะเบียนบ้าน</label>
                    <input
                      type="text"
                      value={regRegisteredAddress}
                      onChange={(e) => setRegRegisteredAddress(e.target.value)}
                      placeholder="เช่น 12/34 ม.5 ต.ในเมือง อ.เมือง จ.ขอนแก่น"
                      required
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-white text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">เพศตามทะเบียน</label>
                      <select
                        value={regGender}
                        onChange={(e: any) => setRegGender(e.target.value)}
                        className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-white text-slate-900 focus:outline-none cursor-pointer"
                      >
                        <option value="Female">👩 หญิง</option>
                        <option value="Male">👨 ชาย</option>
                        <option value="Other">🌈 อื่นๆ</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ประสบการณ์ (ปี)</label>
                      <input
                        type="number"
                        value={regExperience}
                        onChange={(e) => setRegExperience(parseInt(e.target.value) || 1)}
                        required
                        min={0}
                        max={50}
                        className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-white text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs py-3.5 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  💆 ยืนยันสมัครสมาชิกพนักงานนวด
                </button>

                <div className="pt-2 text-center space-y-1.5">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register_customer'); setRegRole('Customer'); }}
                    className="text-[11px] font-bold text-sky-600 hover:text-sky-700 transition-colors cursor-pointer block w-full"
                  >
                    ต้องการสมัครเป็นลูกค้าทั่วไป? คลิกที่นี่
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer block w-full"
                  >
                    มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
                  </button>
                </div>
              </form>
            )}

          </div>
        ) : (
          /* CASE 2: USER IS AUTHENTICATED & READY IN SESSION */
          <div>
            
            {/* Direct match error notification alert if user has logged in but role doesn't match selection */}
            {userRoleMode !== currentUser.Role && (
              <div className="mb-6 p-4 bg-amber-50 dark:bg-slate-900 border border-amber-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>
                    บัญชีผู้ใช้ปัจจุบันของคุณคือบทบาท **"{currentUser.Role}"** แต่หน้าจอนี้แสดงระบบ **"{userRoleMode}"**
                  </span>
                </div>
                <button
                  onClick={() => handleSandboxAutofill(userRoleMode)}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  ซิงค์สิทธิ์หรือแก้ไขบัญชีด่วน
                </button>
              </div>
            )}

            {/* ROUTE PANELS */}
            {userRoleMode === 'Customer' && (
              <CustomerPanel 
                currentUser={currentUser}
                settings={settings}
                onShowToast={showToast}
                onPlayNotificationSound={playChime}
                onUpdateUser={setCurrentUser}
              />
            )}

            {userRoleMode === 'Staff' && (
              <StaffPanel 
                currentUser={currentUser}
                currentStaff={currentStaff}
                settings={settings}
                onLogout={handleLogout}
                onShowToast={showToast}
                onPlayNotificationSound={playChime}
                onUpdateStaffData={(updatedStaff) => setCurrentStaff(updatedStaff)}
              />
            )}

            {userRoleMode === 'Admin' && (
              <AdminPanel 
                currentUser={currentUser}
                settings={settings}
                onUpdateSettings={(newSettings) => setSettings(newSettings)}
                onShowToast={showToast}
              />
            )}

          </div>
        )}

      </main>

      {/* Sleek Bottom Status Bar */}
      <footer className={`h-11 border-t px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left py-2 sm:py-0 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-gray-100 text-slate-500'
      }`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-[#00B14F] rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider">System Online</span>
          </div>
          <span className="text-[10px] text-gray-300">|</span>
          <span className="text-[10px] font-semibold">Google Maps APIs Integrated</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px]">SabaiDee Home Massage App</span>
          <span className="text-[10px] px-3 py-1 bg-sky-500/10 text-sky-600 rounded-full font-bold">Ver 1.2.0 (GAS Database)</span>
        </div>
      </footer>

    </div>
  );
}
