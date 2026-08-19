const fs = require('fs');
let content = fs.readFileSync('src/components/StaffPanel.tsx', 'utf8');

const targetStr = `          {/* Bank QR Code display mock */}
          <div className="bg-slate-50 rounded-2xl p-4 text-center space-y-3 border border-slate-100 max-w-sm mx-auto">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">แสกน QR Code จ่ายพร้อมเพย์</span>
            <div className="w-40 h-40 bg-white border border-slate-200 rounded-xl mx-auto flex items-center justify-center p-2">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SabaiDeeMassagePromptPayMock" className="w-full h-full" alt="QR" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-700">บจก. สบายดี โฮมมาสซาจ</p>
              <p className="text-[10px] text-slate-400 mt-0.5">เบอร์รับโอน: 081-234-5678 (ฟรีค่าธรรมเนียม)</p>
            </div>
          </div>`;

const replacement = `          {/* Bank QR Code display mock */}
          <div className="bg-slate-50 rounded-2xl p-4 text-center space-y-3 border border-slate-100 max-w-sm mx-auto">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">แสกน QR Code จ่ายโอนเงิน</span>
            {settings.qrCodeImage && (
              <div className="w-40 h-40 bg-white border border-slate-200 rounded-xl mx-auto flex items-center justify-center p-2">
                <img src={settings.qrCodeImage} className="w-full h-full object-cover" alt="QR Code" />
              </div>
            )}
            <div>
              <p className="text-xs font-black text-slate-700">{settings.bankAccountName || 'บจก. สบายดี โฮมมาสซาจ'}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">{settings.bankName || 'ธนาคารทั่วไป'}</p>
              <p className="text-[10px] text-sky-600 mt-0.5 font-bold">เลขที่บัญชี: {settings.bankAccount || '081-234-5678'}</p>
            </div>
          </div>`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/components/StaffPanel.tsx', content);
