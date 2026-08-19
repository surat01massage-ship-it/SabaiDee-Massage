const fs = require('fs');
let content = fs.readFileSync('src/components/CustomerPanel.tsx', 'utf8');

const targetEditImg = `<div className="flex flex-col items-center mb-6">
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
                </div>`;

const targetViewImg = `<img 
                  src={currentUser.ProfileImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"} 
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-sky-100 shadow-sm mb-4"
                  onError={(e: any) => { e.target.src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"; }}
                />`;


content = content.replace(targetEditImg, '');
content = content.replace(targetViewImg, '<div className="w-20 h-20 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center text-3xl font-black shadow-sm mb-4">{currentUser.Name ? currentUser.Name[0] : "ล"}</div>');
fs.writeFileSync('src/components/CustomerPanel.tsx', content);
