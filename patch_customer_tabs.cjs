const fs = require('fs');
let content = fs.readFileSync('src/components/CustomerPanel.tsx', 'utf8');

const targetState = `  const [showSuggestions, setShowSuggestions] = useState(false);`;
const replacementState = `  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'booking'>('home');`;
content = content.replace(targetState, replacementState);

const targetHandleConfirm = `      setActiveBooking(data.booking);
      fetchStaff(); // refresh locations
      setTimeout(() => {`;
const replacementHandleConfirm = `      setActiveBooking(data.booking);
      setActiveTab('booking');
      fetchStaff(); // refresh locations
      setTimeout(() => {`;
content = content.replace(targetHandleConfirm, replacementHandleConfirm);

const targetRender = `  return (
    <div className="space-y-6 max-w-lg mx-auto pb-10" id="customer-view-root">`;
const replacementRender = `  return (
    <div className="space-y-6 max-w-lg mx-auto pb-10" id="customer-view-root">
      {/* Customer Tabs */}
      <div className="bg-white border border-slate-100 rounded-2xl p-1.5 flex shadow-sm">
        <button
          onClick={() => setActiveTab('home')}
          className={\`flex-1 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer \${
            activeTab === 'home' 
              ? 'bg-sky-500 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-50'
          }\`}
        >
          หน้าแรก (จองนวด)
        </button>
        <button
          onClick={() => setActiveTab('booking')}
          className={\`flex-1 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer relative \${
            activeTab === 'booking' 
              ? 'bg-sky-500 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-50'
          }\`}
        >
          รายการจองของฉัน
          {activeBooking && (
            <span className="absolute top-1.5 right-4 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>`;
content = content.replace(targetRender, replacementRender);

const targetCondition1 = `      {/* Booking Progress Tracker / Active Booking State Card */}
      {activeBooking && (`;
const replacementCondition1 = `      {/* Booking Progress Tracker / Active Booking State Card */}
      {activeTab === 'booking' && activeBooking && (`;
content = content.replace(targetCondition1, replacementCondition1);

const targetCondition2 = `      {/* Main Reservation panel when NO booking is active */}
      {!activeBooking && (`;
const replacementCondition2 = `      {/* Booking empty state */}
      {activeTab === 'booking' && !activeBooking && (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 shadow-sm text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">ยังไม่มีรายการจอง</h3>
          <p className="text-xs text-slate-500 mb-6">คุณยังไม่ได้ทำการจองนวดในขณะนี้</p>
          <button
            onClick={() => setActiveTab('home')}
            className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-colors"
          >
            ไปที่หน้าจองนวด
          </button>
        </div>
      )}

      {/* Main Reservation panel when NO booking is active */}
      {activeTab === 'home' && (`;
content = content.replace(targetCondition2, replacementCondition2);

fs.writeFileSync('src/components/CustomerPanel.tsx', content);
