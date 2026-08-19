import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Clock, Star, MapPin, CheckCircle, Bell, History, TrendingUp, 
  User as UserIcon, LogOut, Check, X, ShieldAlert, CreditCard, ChevronRight, Upload,
  Compass, ExternalLink
} from 'lucide-react';
import { User, Staff, Booking, CreditTransaction, AppSettings } from '../types';

interface StaffPanelProps {
  currentUser: User | null;
  currentStaff: Staff | null;
  settings: AppSettings;
  onLogout: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onPlayNotificationSound?: () => void;
  onUpdateStaffData: (updatedStaff: Staff) => void;
}

export default function StaffPanel({
  currentUser,
  currentStaff,
  settings,
  onLogout,
  onShowToast,
  onPlayNotificationSound,
  onUpdateStaffData
}: StaffPanelProps) {
  // Check if staff details are loaded
  const staff = currentStaff;

  // UI state controllers
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'credit' | 'profile'>('dashboard');
  
  // Database states
  const [bookings, setBookings] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [incomingBooking, setIncomingBooking] = useState<any | null>(null);
  const [ongoingBooking, setOngoingBooking] = useState<any | null>(null);

  // Countdown timer for incoming offer
  const [countdown, setCountdown] = useState(30);

  // Form states
  const [topupAmount, setTopupAmount] = useState("");
  const [slipImage, setSlipImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Profile Edit states
  const [editProfileImage, setEditProfileImage] = useState("");
  const [editNickname, setEditNickname] = useState("");
  const [editAge, setEditAge] = useState(30);
  const [editWeight, setEditWeight] = useState(50);
  const [editHeight, setEditHeight] = useState(160);
  const [editGender, setEditGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [editRegisteredAddress, setEditRegisteredAddress] = useState("");
  const [editExperience, setEditExperience] = useState(3);
  const [editDescription, setEditDescription] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [editOfferedServices, setEditOfferedServices] = useState<string[]>([]);
  const [editMaxJobDistance, setEditMaxJobDistance] = useState(15);

  // Load initial settings on edit form
  useEffect(() => {
    if (staff && currentUser) {
      setEditProfileImage(currentUser.ProfileImage || "");
      setEditNickname(staff.Nickname);
      setEditAge(staff.Age);
      setEditWeight(staff.Weight || 50);
      setEditHeight(staff.Height || 160);
      setEditGender(staff.Gender || 'Female');
      setEditRegisteredAddress(staff.RegisteredAddress || '');
      setEditExperience(staff.Experience);
      setEditDescription(staff.Description);
      setEditOfferedServices(staff.OfferedServices || []);
      setEditMaxJobDistance(staff.MaxJobDistance || 15);
    }
  }, [staff, currentUser]);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => setServices(data.filter((s: any) => s.Active === 'ON')))
      .catch(console.error);
  }, []);

  // Periodic Polling for incoming bookings, ongoing state, and credit transactions
  useEffect(() => {
    if (!staff) return;

    fetchStaffData();
    const interval = setInterval(() => {
      fetchStaffData();
    }, 4000); // Polling every 4 seconds for immediate incoming alert response

    return () => clearInterval(interval);
  }, [staff?.StaffID]);

  const fetchStaffData = async () => {
    if (!staff) return;
    try {
      // 1. Fetch Bookings list
      const bRes = await fetch('/api/bookings');
      const bData = await bRes.json();
      const staffJobs = bData.filter((b: any) => b.StaffID === staff.StaffID);
      setBookings(staffJobs);

      // 2. Identify Incoming Booking (Status Waiting, offered to this Staff specifically)
      const incoming = bData.find((b: any) => 
        b.StaffID === staff.StaffID && 
        b.Status === 'Waiting'
      );
      
      if (incoming) {
        if (!incomingBooking || incomingBooking.BookingID !== incoming.BookingID) {
          // Play buzzer sound
          if (onPlayNotificationSound) onPlayNotificationSound();
          onShowToast("🔔 มีงานนวดใหม่เรียกตัวด่วนเข้ามาค่ะ! กรุณากดรับสาย", "success");
          setCountdown(30); // reset timer
        }
        setIncomingBooking(incoming);
      } else {
        setIncomingBooking(null);
      }

      // 3. Identify Ongoing active booking (Accepted or Working)
      const ongoing = staffJobs.find((b: any) => 
        b.Status === 'Accepted' || b.Status === 'Working'
      );
      setOngoingBooking(ongoing || null);

      // 4. Fetch Credit Transactions
      const txRes = await fetch('/api/credits/transactions');
      const txData = await txRes.json();
      setTransactions(txData.filter((t: any) => t.StaffID === staff.StaffID));

    } catch (e) {
      console.error(e);
    }
  };

  // Sound/countdown ticking
  useEffect(() => {
    if (!incomingBooking) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Expiration triggered automatically on next matching tick, so just clear here
          setIncomingBooking(null);
          return 30;
        }
        // Play notification sound continuously while waiting
        if (prev % 2 === 0 && onPlayNotificationSound) {
           onPlayNotificationSound();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingBooking, onPlayNotificationSound]);

  // Real GPS updater if online (Available: ON)
  useEffect(() => {
    if (!staff || staff.Available !== 'ON') return;

    const updateLocationToServer = (lat: number, lng: number) => {
      fetch('/api/staff/location', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: staff.StaffID,
          latitude: lat,
          longitude: lng
        })
      }).then(() => {
        const updated = { ...staff, CurrentLatitude: lat, CurrentLongitude: lng };
        onUpdateStaffData(updated);
      }).catch(console.error);
    };

    // 1. Force location check right now
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => updateLocationToServer(pos.coords.latitude, pos.coords.longitude),
        (err) => console.warn("Staff GPS init error (can be ignored in preview):", err.message),
        { enableHighAccuracy: true }
      );
    }

    // 2. Poll every 15s to update real location
    const gpsTimer = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => updateLocationToServer(pos.coords.latitude, pos.coords.longitude),
          (err) => console.warn("Staff GPS poll error (can be ignored in preview):", err.message),
          { enableHighAccuracy: true }
        );
      }
    }, 15000);

    return () => clearInterval(gpsTimer);
  }, [staff?.Available, staff?.StaffID]);

  // Toggle online/offline status
  const handleToggleOnline = async () => {
    if (!staff) return;
    const nextStatus = staff.Available === 'ON' ? 'OFF' : 'ON';

    try {
      const res = await fetch('/api/staff/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: staff.StaffID,
          available: nextStatus
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onUpdateStaffData({ ...staff, Available: nextStatus });
      onShowToast(
        nextStatus === 'ON' 
          ? "🟢 เข้าสู่โหมดออนไลน์! ระบบ GPS เริ่มตรวจจับพิกัดเพื่อรับงานรอบตัวคุณแล้ว" 
          : "🔴 ปิดรับงานสำเร็จ พักผ่อนให้เต็มที่นะคะ", 
        "info"
      );
    } catch (e: any) {
      onShowToast(e.message, "error");
    }
  };

  // Respond to Booking Offer
  const handleAcceptJob = async (action: 'accept' | 'reject') => {
    if (!incomingBooking || !staff) return;

    if (action === 'reject') {
      try {
        await fetch(`/api/bookings/${incomingBooking.BookingID}/action`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reject', staffId: staff.StaffID })
        });
        setIncomingBooking(null);
        onShowToast("ปฏิเสธงานเรียกนวดเรียบร้อยแล้ว", "info");
      } catch (e) {
        setIncomingBooking(null);
      }
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${incomingBooking.BookingID}/action`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept',
          staffId: staff.StaffID
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ไม่สามารถกดยอมรับงานนี้ได้");
      }

      onShowToast("🎉 ยอมรับงานบริการนวดสำเร็จ! เริ่มเดินทางไปให้บริการได้ทันที", "success");
      setIncomingBooking(null);
      fetchStaffData();
      
      // Update local wallet view
      onUpdateStaffData({
        ...staff,
        Credit: staff.Credit - incomingBooking.ServicePrice * 0.15 // subtract credit representing commission fee
      });
    } catch (e: any) {
      onShowToast(e.message, "error");
    }
  };

  // Advance ongoing work status
  const handleUpdateOngoingStatus = async (actionName: 'start_travel' | 'complete') => {
    if (!ongoingBooking) return;

    try {
      const res = await fetch(`/api/bookings/${ongoingBooking.BookingID}/action`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionName,
          staffId: staff?.StaffID
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (actionName === 'start_travel') {
        onShowToast("อัปเดตสถานะ: พนักงานนวดกำลังเดินทางพบบ้านลูกค้าแล้วค่ะ", "info");
      } else {
        onShowToast("💆 การให้บริการเสร็จสมบูรณ์เรียบร้อยแล้ว! รายได้โอนเข้าประวัติแล้ว", "success");
        if (staff) {
          // Increase TotalIncome and Credit transaction logs locally
          onUpdateStaffData({
            ...staff,
            TotalIncome: staff.TotalIncome + (ongoingBooking.NetIncome || ongoingBooking.TotalPrice),
            TotalJobs: staff.TotalJobs + 1
          });
        }
      }
      fetchStaffData();
    } catch (e: any) {
      onShowToast(e.message, "error");
    }
  };

  // Submit Credit Topup proposal
  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff || !topupAmount) return;

    setIsUploading(true);
    try {
      const res = await fetch('/api/credits/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: staff.StaffID,
          amount: parseFloat(topupAmount),
          slipImage: slipImage
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาดในการตรวจสอบสลิป');

      if (data.transaction) {
        if (data.transaction.Status === 'Approved') {
          onShowToast(`🎉 ตรวจสอบสลิปผ่าน AI สมบูรณ์! เติมเครดิตอัตโนมัติ +${data.transaction.Amount} CR เรียบร้อยแล้ว`, "success");
          if (data.newCredit !== undefined) {
            onUpdateStaffData({ ...staff, Credit: data.newCredit });
          }
          if (onPlayNotificationSound) onPlayNotificationSound();
          setTopupAmount("");
          setSlipImage("");
          setActiveTab('dashboard');
        } else if (data.transaction.Status === 'Reject') {
          onShowToast(data.transaction.AdminRemark || data.error || "❌ สลิปไม่ผ่านการตรวจสอบ (อาจเป็นสลิปซ้ำหรือสลิปไม่ถูกต้อง)", "error");
        } else {
          onShowToast("ส่งรายการแจ้งโอนเงินแล้ว! ระบบกำลังรอเจ้าหน้าที่ตรวจสอบความถูกต้อง", "info");
          setTopupAmount("");
          setSlipImage("");
        }
        fetchStaffData();
      }
    } catch (e: any) {
      onShowToast(e.message, "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Save profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.UserID,
          name: currentUser.Name,
          profileImage: editProfileImage,
          staffInfo: {
            nickname: editNickname,
            age: editAge,
            weight: editWeight,
            height: editHeight,
            gender: editGender,
            registeredAddress: editRegisteredAddress,
            experience: editExperience,
            description: editDescription,
            offeredServices: editOfferedServices,
            maxJobDistance: editMaxJobDistance
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.staff) {
        onUpdateStaffData(data.staff);
      }
      onShowToast("บันทึกการแก้ไขโปรไฟล์พนักงานสำเร็จแล้วค่ะ", "success");
      setActiveTab('dashboard');
    } catch (e: any) {
      onShowToast(e.message, "error");
    }
  };

  if (!staff) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center max-w-md mx-auto shadow-sm space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
        <h3 className="font-bold text-slate-800 text-base">รอการอนุมัติพนักงาน</h3>
        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
          บัญชีพนักงานนวดของคุณได้รับการสร้างในฐานข้อมูล (Sheet Users & Staff) สำเร็จแล้ว แต่ยังอยู่ในสถานะ <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-extrabold text-[10px]">รอดำเนินการ (Pending)</span>
        </p>
        <p className="text-[10px] text-slate-400">
          กรุณาสลับไปยังบทบาท **"แอดมิน"** ด้านล่างเพื่ออนุมัติข้อมูลพนักงานของคุณเพื่อเริ่มใช้ระบบค่ะ
        </p>
      </div>
    );
  }

  // Calculate earning sums
  const completedJobs = bookings.filter(b => b.Status === 'Completed');
  const todayEarnings = completedJobs
    .filter(b => b.BookingDate === new Date().toISOString().split('T')[0])
    .reduce((sum, b) => sum + (b.NetIncome || b.TotalPrice), 0);
  const currentMonthPrefix = new Date().toISOString().substring(0, 7);
  const thisMonthEarnings = completedJobs
    .filter(b => b.BookingDate.startsWith(currentMonthPrefix))
    .reduce((sum, b) => sum + (b.NetIncome || b.TotalPrice), 0);

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-12" id="staff-view-root">
      
      {/* ONLINE / OFFLINE TOGGLE SWITCHER (Grab style) */}
      <div className="bg-white text-slate-800 rounded-3xl p-5 shadow-sm border border-slate-200 flex items-center justify-between relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={currentUser?.ProfileImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"} 
              className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shadow" 
              alt="Profile" 
            />
            <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
              staff.Available === 'ON' ? 'bg-sky-500 animate-pulse' : 'bg-rose-500'
            }`} />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-slate-900">พี่{staff.Nickname}</span>
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                staff.VerifyStatus === 'Approved' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
              }`}>{staff.VerifyStatus}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
              {staff.Available === 'ON' ? '🟢 พร้อมรับงานนวดแบบเรียลไทม์' : '⚪ ออฟไลน์พักผ่อน'}
            </p>
          </div>
        </div>

        {/* Sliding Toggle Switch (slide left/right) */}
        <button
          onClick={handleToggleOnline}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
          aria-label="Toggle Job Acceptance Status"
        >
          <span className={`text-xs font-black transition-colors ${
            staff.Available === 'ON' ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'
          }`}>
            {staff.Available === 'ON' ? 'เปิดรับงานอยู่' : 'ปิดรับงาน'}
          </span>
          <div className={`w-14 h-7 flex items-center rounded-full p-1 transition-all duration-300 ease-in-out ${
            staff.Available === 'ON' ? 'bg-sky-500' : 'bg-slate-200'
          }`}>
            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-all duration-300 ease-in-out ${
              staff.Available === 'ON' ? 'translate-x-7' : 'translate-x-0'
            }`} />
          </div>
        </button>
      </div>

      {/* REVENUE STATS METRIC DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Main Wallet Grid cards */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Wallet credit card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 bg-sky-500/5 rounded-full" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">กระเป๋าเครดิต (CR)</span>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-2xl font-black text-slate-800">{staff.Credit.toFixed(0)}</span>
                <span className="text-xs font-semibold text-slate-500">เครดิต</span>
              </div>
              <button
                onClick={() => setActiveTab('credit')}
                className="text-[9px] font-extrabold text-sky-600 hover:text-sky-700 flex items-center gap-0.5 mt-2.5 cursor-pointer bg-sky-50 px-2 py-1 rounded-md w-fit"
              >
                <CreditCard className="w-3 h-3" /> เติมเครดิตที่นี่
              </button>
            </div>

            {/* Income Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">รายได้วันนี้</span>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-2xl font-black text-sky-600">฿{todayEarnings}</span>
                <span className="text-xs font-semibold text-slate-500">บาท</span>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 space-y-1">
                <div className="flex justify-between items-center text-[9px] font-semibold text-slate-500">
                  <span>รายได้เดือนนี้:</span>
                  <span className="text-sky-600 font-bold">฿{thisMonthEarnings}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-semibold text-slate-400">
                  <span>รายได้สะสมทั้งหมด:</span>
                  <span>฿{staff.TotalIncome}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Average Stars ratings summary widget */}
          <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex items-center justify-around text-center">
            <div>
              <span className="text-[9px] font-bold text-slate-400 block uppercase">งานสำเร็จทั้งหมด</span>
              <span className="text-base font-extrabold text-slate-800 block mt-1">{staff.TotalJobs} ครั้ง</span>
            </div>
            <div className="w-[1px] h-8 bg-slate-100" />
            <div>
              <span className="text-[9px] font-bold text-slate-400 block uppercase">เรตติ้งดาวเฉลี่ย</span>
              <div className="flex items-center justify-center text-amber-500 font-extrabold text-sm mt-1">
                <Star className="w-4 h-4 fill-current mr-0.5" />
                <span>{staff.Rating}</span>
              </div>
            </div>
            <div className="w-[1px] h-8 bg-slate-100" />
            <div>
              <span className="text-[9px] font-bold text-slate-400 block uppercase">รีวิวความเห็นลูกค้า</span>
              <span className="text-base font-extrabold text-slate-800 block mt-1">{staff.ReviewCount} รายการ</span>
            </div>
          </div>

          {/* ACTIVE ONGOING BOOKING CONTROLS */}
          {ongoingBooking && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-xs font-black text-amber-800">กำลังทำงานนำส่ง: #ID {ongoingBooking.BookingID}</span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  {ongoingBooking.Status}
                </span>
              </div>

              <div className="text-xs space-y-2 text-slate-700">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">ลูกค้า</span>
                  <span className="font-bold text-slate-900">{ongoingBooking.CustomerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">บริการ</span>
                  <span className="font-bold text-slate-900">{ongoingBooking.ServiceName} ({ongoingBooking.ServiceDuration} นาที)</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-slate-500">พิกัดจัดส่ง</span>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="font-bold text-slate-900 max-w-[200px] truncate" title={ongoingBooking.CustomerAddress}>{ongoingBooking.CustomerAddress}</span>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${ongoingBooking.CustomerLatitude || 13.7431},${ongoingBooking.CustomerLongitude || 100.5884}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-sky-600 hover:text-sky-700 bg-white border border-sky-100 rounded-md px-2 py-0.5 shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Compass className="w-3 h-3 text-sky-500 animate-pulse" />
                      เปิดพิกัด Google Maps ↗
                    </a>
                  </div>
                </div>
              </div>

              {/* Status workflow steppers */}
              <div className="flex gap-3 pt-2">
                {ongoingBooking.Status === 'Accepted' ? (
                  <>
                    <button
                      onClick={() => handleUpdateOngoingStatus('start_travel')}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs py-3 rounded-xl transition-colors cursor-pointer"
                    >
                      🛵 ฉันเริ่มเดินทางแล้ว
                    </button>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${staff?.CurrentLatitude || 13.7649},${staff?.CurrentLongitude || 100.5383}&destination=${ongoingBooking.CustomerLatitude || 13.7431},${ongoingBooking.CustomerLongitude || 100.5884}&travelmode=driving`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs py-3 rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center gap-1 shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      นำทาง Google Maps
                    </a>
                  </>
                ) : ongoingBooking.Status === 'Working' ? (
                  <button
                    onClick={() => handleUpdateOngoingStatus('complete')}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white font-black text-xs py-3 rounded-xl transition-colors cursor-pointer shadow-md"
                  >
                    💆 นวดบริการเสร็จสมบูรณ์ (รับเงิน ฿{ongoingBooking.TotalPrice})
                  </button>
                ) : null}
              </div>
            </div>
          )}

          {/* Simple income list widget */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">ความเคลื่อนไหวล่าสุด</h4>
            {completedJobs.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">คุณยังไม่มีประวัติรายรับในวันนี้</div>
            ) : (
              <div className="space-y-2">
                {completedJobs.slice(-3).map((job) => (
                  <div key={job.BookingID} className="flex items-center justify-between text-xs py-1">
                    <div>
                      <span className="font-bold text-slate-800 block">{job.ServiceName}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{job.BookingDate} • ลูกค้า {job.CustomerName}</span>
                    </div>
                    <span className="font-bold text-sky-600">+฿{job.NetIncome || job.TotalPrice}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: CREDIT WALLET TOP-UP */}
      {activeTab === 'credit' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-base font-black text-slate-800">แจ้งประวัติโอนเงิน / เติมเครดิต</h3>
          
          {/* Bank QR Code display mock */}
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
          </div>

          <form onSubmit={handleTopupSubmit} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">จำนวนเงินที่โอนจ่าย (บาท)</label>
              <input
                type="number"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="กรอกตามสลิป เช่น 500"
                required
                className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">อัปโหลดภาพใบเสร็จโอนเงิน (สลิป)</label>
              
              <div className="flex gap-4 items-center bg-slate-50 border border-dashed border-slate-200 p-4 rounded-xl relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setSlipImage(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 rounded bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  {slipImage && !slipImage.startsWith('http') ? (
                    <img src={slipImage} className="w-full h-full object-cover" alt="Slip Preview" />
                  ) : slipImage ? (
                    <img src={slipImage} className="w-full h-full object-cover" alt="Slip Preview" />
                  ) : (
                    <Upload className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <span className="text-[10px] font-bold text-slate-600 block flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" /> แตะเพื่อแนบรูปภาพสลิปจากเครื่อง
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-black py-3 rounded-xl text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {isUploading ? 'กำลังส่งแจ้งโอน...' : 'ยืนยันแจ้งเติมเงิน'}
              </button>
            </div>
          </form>

          {/* Past Transactions list */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide text-left">ประวัติการเติมเครดิตของคุณ</h4>
            <div className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">คุณยังไม่มีรายการโอนเงินในระบบ</div>
              ) : (
                transactions.map((t) => (
                  <div key={t.TransactionID} className="flex items-center justify-between text-xs py-3 gap-3">
                    <div className="text-left space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">฿{t.Amount} บาท</span>
                        {t.IsAutoApproved && (
                          <span className="text-[8px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-full">
                            🤖 AI เติมอัตโนมัติ
                          </span>
                        )}
                        {t.BankName && (
                          <span className="text-[8px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded">
                            {t.BankName}
                          </span>
                        )}
                      </div>
                      {t.SlipRefId && (
                        <p className="text-[9px] text-slate-500 font-mono">Ref: {t.SlipRefId}</p>
                      )}
                      {t.AdminRemark && (
                        <p className="text-[9px] text-slate-400 italic line-clamp-1">{t.AdminRemark}</p>
                      )}
                      <span className="text-[9px] text-slate-400 font-semibold block">{t.CreatedDate.split('T')[0]}</span>
                    </div>
                    <div className="shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        t.Status === 'Approved' ? 'bg-sky-50 text-sky-700' :
                        t.Status === 'Reject' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                      }`}>{t.Status === 'Approved' ? 'อนุมัติแล้ว' : t.Status === 'Reject' ? 'ปฏิเสธ' : 'รอตรวจสอบ'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: WORK HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-800 text-left">ประวัติการรับงานทั้งหมด</h3>
          
          <div className="divide-y divide-slate-100">
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">ไม่พบประวัติผลงานรับงานของคุณ</div>
            ) : (
              bookings.slice().reverse().map((b) => (
                <div key={b.BookingID} className="py-4 flex justify-between items-start text-xs border-b border-slate-100 last:border-0">
                  <div className="text-left space-y-1">
                    <span className="font-bold text-slate-800 block text-sm">{b.ServiceName}</span>
                    <span className="text-slate-400 block font-semibold">วันที่จอง: {b.BookingDate} • {b.BookingTime} น.</span>
                    <span className="text-slate-500 block font-semibold">ผู้สั่ง: {b.CustomerName} ({b.Distance.toFixed(2)} กม.)</span>
                    
                    {b.ReviewScore && (
                      <div className="mt-2 pt-2 border-t border-slate-50 inline-block">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`w-3 h-3 ${star <= b.ReviewScore ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                        {b.ReviewComment && <p className="text-slate-500 italic mt-1 text-[10px]">"{b.ReviewComment}"</p>}
                      </div>
                    )}
                  </div>

                  <div className="text-right space-y-1.5 shrink-0">
                    <span className="text-slate-800 font-extrabold text-sm block">฿{b.NetIncome || b.TotalPrice}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                      b.Status === 'Completed' ? 'bg-sky-50 text-sky-700' :
                      b.Status === 'Cancel' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                    }`}>{b.Status === 'Completed' ? 'สำเร็จ' : b.Status === 'Cancel' ? 'ยกเลิกแล้ว' : b.Status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PROFILE SETTINGS */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-800 text-left">ข้อมูลพนักงานนวด</h3>
            <div className="grid grid-cols-2 gap-y-4 text-left text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">ไอดีพนักงาน</span>
                <span className="block font-black text-slate-800">{staff.StaffID}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">ชื่อ-นามสกุล</span>
                <span className="block font-black text-slate-800">{currentUser?.Name}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">น้ำหนัก</span>
                <span className="block font-black text-slate-800">{staff.Weight || '-'} กก.</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">ส่วนสูง</span>
                <span className="block font-black text-slate-800">{staff.Height || '-'} ซม.</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">เพศ</span>
                <span className="block font-black text-slate-800">
                  {staff.Gender === 'Male' ? 'ชาย' : staff.Gender === 'Female' ? 'หญิง' : 'อื่นๆ'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">อายุ</span>
                <span className="block font-black text-slate-800">{staff.Age} ปี</span>
              </div>
              <div className="col-span-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">คะแนนรีวิว</span>
                <div className="flex items-center gap-1 font-black text-amber-500 mt-0.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{staff.Rating} ({staff.ReviewCount} รีวิว)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-800 text-left">แก้ไขประวัติเพิ่มเติม</h3>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">รูปโปรไฟล์</label>
              
              <div className="flex gap-4 items-center bg-slate-50 border border-dashed border-slate-200 p-4 rounded-xl relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditProfileImage(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  {editProfileImage ? (
                    <img src={editProfileImage} className="w-full h-full object-cover" alt="Profile Preview" />
                  ) : (
                    <UserIcon className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <span className="text-[10px] font-bold text-slate-600 block flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" /> แตะเพื่อเลือกรูปภาพจากเครื่อง
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ชื่อเรียก (ชื่อเล่น)</label>
              <input
                type="text"
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                required
                className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">เพศ</label>
                <select
                  value={editGender}
                  onChange={(e: any) => setEditGender(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none cursor-pointer"
                >
                  <option value="Female">👩 หญิง</option>
                  <option value="Male">👨 ชาย</option>
                  <option value="Other">🌈 อื่นๆ</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">อายุ (ปี)</label>
                <input
                  type="number"
                  value={editAge}
                  onChange={(e) => setEditAge(parseInt(e.target.value) || 30)}
                  required
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">น้ำหนัก (กก.)</label>
                <input
                  type="number"
                  value={editWeight}
                  onChange={(e) => setEditWeight(parseInt(e.target.value) || 50)}
                  required
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ส่วนสูง (ซม.)</label>
                <input
                  type="number"
                  value={editHeight}
                  onChange={(e) => setEditHeight(parseInt(e.target.value) || 160)}
                  required
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ที่อยู่ตามทะเบียนบ้าน</label>
              <input
                type="text"
                value={editRegisteredAddress}
                onChange={(e) => setEditRegisteredAddress(e.target.value)}
                placeholder="ที่อยู่ตามบัตรประชาชน..."
                required
                className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ประสบการณ์ทำงาน (ปี)</label>
              <input
                type="number"
                value={editExperience}
                onChange={(e) => setEditExperience(parseInt(e.target.value) || 1)}
                required
                className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ระยะทางที่รับงานสูงสุด (กิโลเมตร)</label>
              <input
                type="number"
                step="0.01"
                value={editMaxJobDistance}
                onChange={(e) => setEditMaxJobDistance(parseFloat(e.target.value) || 15)}
                required
                className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">คำอธิบายประวัตินวด</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                placeholder="อธิบายผลงาน จุดเด่นในการนวดนวดคอบ่าไหล่ บรรเทาอัมพฤกษ์ ฯลฯ"
                className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">บริการที่รับงาน</label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-1 gap-2">
                {services.map(service => (
                  <label key={service.ServiceID} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editOfferedServices.includes(service.ServiceID)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditOfferedServices(prev => [...prev, service.ServiceID]);
                        } else {
                          setEditOfferedServices(prev => prev.filter(id => id !== service.ServiceID));
                        }
                      }}
                      className="w-4 h-4 text-sky-500 rounded border-slate-300 focus:ring-sky-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">{service.ServiceName}</span>
                  </label>
                ))}
                {services.length === 0 && (
                  <span className="text-xs text-slate-400">กำลังโหลดบริการ...</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-xl transition-colors cursor-pointer"
            >
              บันทึกการแก้ไขโปรไฟล์พนักงาน
            </button>
          </form>

          <button
            onClick={onLogout}
            className="w-full mt-4 text-xs font-black text-rose-500 border border-rose-500/10 hover:bg-rose-50 py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> ออกจากระบบพนักงาน
          </button>
        </div>
        </div>
      )}

      {/* FOOTER TAB SYSTEM NAVIGATION */}
      <div className="bg-white border-t border-slate-100 fixed bottom-0 left-0 right-0 py-2.5 px-4 flex items-center justify-around z-40 max-w-lg mx-auto shadow-2xl">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            activeTab === 'dashboard' ? 'text-sky-600 font-extrabold' : 'text-slate-400'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[9px] font-bold">แผงรับงาน</span>
        </button>

        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            activeTab === 'history' ? 'text-sky-600 font-extrabold' : 'text-slate-400'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[9px] font-bold">ประวัติรับงาน</span>
        </button>

        <button 
          onClick={() => setActiveTab('credit')}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            activeTab === 'credit' ? 'text-sky-600 font-extrabold' : 'text-slate-400'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[9px] font-bold">เติมเครดิต</span>
        </button>

        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            activeTab === 'profile' ? 'text-sky-600 font-extrabold' : 'text-slate-400'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[9px] font-bold">โปรไฟล์</span>
        </button>
      </div>

      {/* 🚨 OVERLAY 1: GRAB STYLE INCOMING BOOKING ALERT (Pop-up with buzzer) */}
      {incomingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-sky-500 rounded-3xl max-w-sm w-full p-6 text-slate-800 text-center space-y-6 shadow-2xl relative overflow-hidden animate-bounce-short">
            
            <div className="w-14 h-14 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto animate-pulse">
              <Bell className="w-8 h-8 fill-current" />
            </div>

            <div className="space-y-3">
              <span className="text-[10px] bg-sky-100 text-sky-800 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                มีงานใหม่สําหรับคุณ ({countdown} วิ)
              </span>
              
              {/* Show Customer Details During Testing */}
              <div className="flex flex-col items-center gap-2 mt-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <img src={incomingBooking.CustomerProfileImage || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'} className="w-12 h-12 rounded-full border-2 border-sky-500 object-cover" alt="Customer" />
                <div>
                  <h3 className="text-sm font-black text-slate-800">{incomingBooking.CustomerName}</h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{incomingBooking.CustomerAddress}</p>
                </div>
              </div>
            </div>

            {/* Price & predicted distance */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-around">
              <div>
                <span className="text-[9px] text-slate-400 block font-bold uppercase">ระยะทาง</span>
                <span className="text-base font-black text-slate-800">{incomingBooking.Distance.toFixed(2)} กม.</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-200" />
              <div>
                <span className="text-[9px] text-slate-400 block font-bold uppercase">ค่าเดินทาง</span>
                <span className="text-base font-black text-slate-800">฿{incomingBooking.TravelFee.toFixed(2)}</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-200" />
              <div>
                <span className="text-[9px] text-slate-400 block font-bold uppercase">รายได้สุทธิ</span>
                <span className="text-lg font-black text-sky-600">฿{incomingBooking.NetIncome || incomingBooking.TotalPrice}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => handleAcceptJob('reject')}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-2xl text-xs transition-colors cursor-pointer"
              >
                ปฏิเสธงาน
              </button>
              <button
                onClick={() => handleAcceptJob('accept')}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-black py-3.5 rounded-2xl text-xs shadow-md transition-all cursor-pointer"
              >
                กดรับงานนวด (฿)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
