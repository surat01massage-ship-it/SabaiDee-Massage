const fs = require('fs');
let content = fs.readFileSync('src/components/CustomerPanel.tsx', 'utf8');

const stateTarget = `  const [activeTab, setActiveTab] = useState<'home' | 'booking' | 'history' | 'profile'>('home');
  const [historyBookings, setHistoryBookings] = useState<any[]>([]);`;

const stateReplacement = `  const [activeTab, setActiveTab] = useState<'home' | 'booking' | 'history' | 'profile'>('home');
  const [historyBookings, setHistoryBookings] = useState<any[]>([]);

  // Profile Edit States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editProfileImage, setEditProfileImage] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const startEditProfile = () => {
    if (currentUser) {
      setEditName(currentUser.Name || "");
      setEditPhone(currentUser.Phone || "");
      setEditProfileImage(currentUser.ProfileImage || "");
      setIsEditingProfile(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    if (!editName.trim() || !editPhone.trim()) {
      onShowToast("กรุณากรอกชื่อและเบอร์โทรศัพท์ให้ครบถ้วน", "error");
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await fetch(\`/api/users/\${currentUser.UserID}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          profileImage: editProfileImage
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (onUpdateUser) onUpdateUser(data.user);
      onShowToast("บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว", "success");
      setIsEditingProfile(false);
    } catch (e: any) {
      onShowToast(e.message, "error");
    } finally {
      setIsSavingProfile(false);
    }
  };`;

content = content.replace(stateTarget, stateReplacement);

const profileViewTarget = `      {/* Profile view */}
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
      )}`;

const profileViewReplacement = `      {/* Profile view */}
      {activeTab === 'profile' && currentUser && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-800">โปรไฟล์ของคุณ</h2>
            {!isEditingProfile && (
              <button 
                onClick={startEditProfile}
                className="text-sky-500 hover:text-sky-600 text-xs font-bold px-3 py-1.5 bg-sky-50 rounded-lg transition-colors"
              >
                แก้ไขโปรไฟล์
              </button>
            )}
          </div>
          
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col items-center">
            
            {isEditingProfile ? (
              <div className="w-full space-y-5">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <img 
                      src={editProfileImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"} 
                      alt="Profile Edit"
                      className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-sm"
                      onError={(e: any) => { e.target.src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"; }}
                    />
                  </div>
                  <div className="w-full">
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">URL รูปโปรไฟล์ (ไม่บังคับ)</label>
                    <input 
                      type="text" 
                      value={editProfileImage}
                      onChange={(e) => setEditProfileImage(e.target.value)}
                      placeholder="วาง URL รูปภาพของคุณ"
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">ชื่อ-นามสกุล</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-sm font-bold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">เบอร์โทรศัพท์</label>
                  <input 
                    type="tel" 
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full text-sm font-bold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsEditingProfile(false)}
                    disabled={isSavingProfile}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="flex-1 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold py-3.5 rounded-xl shadow-md transition-colors disabled:opacity-50"
                  >
                    {isSavingProfile ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <img 
                  src={currentUser.ProfileImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"} 
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-sky-100 shadow-sm mb-4"
                  onError={(e: any) => { e.target.src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"; }}
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
              </>
            )}
          </div>
        </div>
      )}`;

content = content.replace(profileViewTarget, profileViewReplacement);
fs.writeFileSync('src/components/CustomerPanel.tsx', content);
