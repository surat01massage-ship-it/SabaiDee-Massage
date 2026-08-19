const fs = require('fs');
let content = fs.readFileSync('src/components/CustomerPanel.tsx', 'utf8');

const targetState = `  const [selectedStaffForBooking, setSelectedStaffForBooking] = useState<any | null>(null);`;
const replacementState = `  const [selectedStaffForBooking, setSelectedStaffForBooking] = useState<any | null>(null);
  const [selectedStaffReviews, setSelectedStaffReviews] = useState<any[]>([]);`;
content = content.replace(targetState, replacementState);

const targetSelect = `                      onClick={() => {
                        setSelectedStaffProfile(staff);
                        setSelectedStaffForBooking(staff);
                      }}`;
const replacementSelect = `                      onClick={async () => {
                        setSelectedStaffProfile(staff);
                        setSelectedStaffForBooking(staff);
                        try {
                          const res = await fetch(\`/api/staff/\${staff.StaffID}/reviews\`);
                          const data = await res.json();
                          setSelectedStaffReviews(data);
                        } catch (e) {
                          console.error('Failed to fetch reviews', e);
                        }
                      }}`;
content = content.replace(targetSelect, replacementSelect);

const targetCredentials = `                {/* Credentials list */}
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <CheckCircle className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>มีใบประกาศรับรองนวดแผนไทยกระทรวงสาธารณสุข</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <CheckCircle className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>ประวัติการเติมเครดิตและพฤติกรรมยอดเยี่ยม</span>
                  </div>
                </div>`;
const replacementCredentials = `                {/* Credentials list */}
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <CheckCircle className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>มีใบประกาศรับรองนวดแผนไทยกระทรวงสาธารณสุข</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <CheckCircle className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>ประวัติการเติมเครดิตและพฤติกรรมยอดเยี่ยม</span>
                  </div>
                </div>
                
                {/* Reviews Section */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">รีวิวจากลูกค้า ({selectedStaffProfile.ReviewCount})</h4>
                  {selectedStaffReviews.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">ยังไม่มีรีวิว</p>
                  ) : (
                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                      {selectedStaffReviews.map(r => (
                        <div key={r.ReviewID} className="bg-slate-50 p-3 rounded-xl">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-slate-600">{r.CustomerName}</span>
                            <div className="flex items-center text-amber-500">
                              <Star className="w-3 h-3 fill-current mr-0.5" />
                              <span className="text-[10px] font-bold">{r.Score}</span>
                            </div>
                          </div>
                          {r.Comment && <p className="text-xs text-slate-500 mt-1">"{r.Comment}"</p>}
                          <span className="text-[9px] text-slate-400 block mt-2">
                            {new Date(r.CreatedDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>`;
content = content.replace(targetCredentials, replacementCredentials);

fs.writeFileSync('src/components/CustomerPanel.tsx', content);
