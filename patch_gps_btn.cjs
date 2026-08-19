const fs = require('fs');
let content = fs.readFileSync('src/components/CustomerPanel.tsx', 'utf8');

const targetStr = `                      <button
                        onClick={handleSearchAddress}
                        disabled={isSearchingAddress}
                        className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl disabled:opacity-50"
                      >
                        ค้นหา
                      </button>
                    </div>`;

const replacement = `                      <button
                        onClick={handleSearchAddress}
                        disabled={isSearchingAddress}
                        className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl disabled:opacity-50"
                      >
                        ค้นหา
                      </button>
                      <button
                        onClick={handleUseGPS}
                        className="bg-sky-100 hover:bg-sky-200 text-sky-700 text-xs font-bold px-3 py-2 rounded-xl border border-sky-200 shrink-0"
                        title="ใช้ตำแหน่งปัจจุบัน"
                      >
                        📍
                      </button>
                    </div>`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/components/CustomerPanel.tsx', content);
