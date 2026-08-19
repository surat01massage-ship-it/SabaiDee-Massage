const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const targetStr = `            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-xl shadow transition-colors cursor-pointer"
            >`;

const replacement = `            </div>

            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2 pt-4">ตั้งค่าบัญชีรับเงิน (สำหรับเติมเครดิต)</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ธนาคาร</label>
                <input
                  type="text"
                  value={formSettings.bankName || ''}
                  onChange={(e) => setFormSettings({ ...formSettings, bankName: e.target.value })}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none"
                  placeholder="เช่น ธนาคารกสิกรไทย"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">เลขที่บัญชี</label>
                <input
                  type="text"
                  value={formSettings.bankAccount || ''}
                  onChange={(e) => setFormSettings({ ...formSettings, bankAccount: e.target.value })}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none"
                  placeholder="เช่น 123-4-56789-0"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ชื่อบัญชี</label>
                <input
                  type="text"
                  value={formSettings.bankAccountName || ''}
                  onChange={(e) => setFormSettings({ ...formSettings, bankAccountName: e.target.value })}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none"
                  placeholder="เช่น บจก. สบายดี มาสสาจ"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ลิงก์รูปภาพ QR Code</label>
                <input
                  type="text"
                  value={formSettings.qrCodeImage || ''}
                  onChange={(e) => setFormSettings({ ...formSettings, qrCodeImage: e.target.value })}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-xl shadow transition-colors cursor-pointer"
            >`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/components/AdminPanel.tsx', content);
