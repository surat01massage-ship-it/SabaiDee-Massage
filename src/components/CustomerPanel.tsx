import React, { useState, useEffect } from 'react';
import { 
  MapPin, Phone, Star, Sparkles, MessageSquare, Clock, Shield, CheckCircle, 
  ChevronRight, AlertTriangle, X, ShoppingBag, Send, ListCollapse, Award, Compass
} from 'lucide-react';
import { User, Staff, Service, Booking, Review, Notification, AppSettings } from '../types';
import InteractiveMap from './InteractiveMap';

interface CustomerPanelProps {
  currentUser: User | null;
  settings: AppSettings;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onPlayNotificationSound?: () => void;
  onUpdateUser?: (user: User) => void;
}

export default function CustomerPanel({
  currentUser,
  settings,
  onShowToast,
  onPlayNotificationSound,
  onUpdateUser
}: CustomerPanelProps) {
  // Database states
  const [services, setServices] = useState<Service[]>([]);
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [activeBooking, setActiveBooking] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // UI Selection states
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaffProfile, setSelectedStaffProfile] = useState<any | null>(null);
  const [selectedStaffForBooking, setSelectedStaffForBooking] = useState<any | null>(null);
  const [selectedStaffReviews, setSelectedStaffReviews] = useState<any[]>([]);
  
  // Custom Customer Location coordinates
  const [customerLat, setCustomerLat] = useState(13.743122);
  const [customerLng, setCustomerLng] = useState(100.588421);
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerAddressDetail, setCustomerAddressDetail] = useState("");

  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [bookingToReview, setBookingToReview] = useState<any | null>(null);
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Loading indicator states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  
  const [addressSearchQuery, setAddressSearchQuery] = useState("");
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'booking' | 'history' | 'profile'>('home');
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
      const res = await fetch(`/api/users/${currentUser.UserID}`, {
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
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (addressSearchQuery.trim() && showSuggestions) {
        try {
          const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(addressSearchQuery)}`);
          if (res.ok) {
            const data = await res.json();
            setAddressSuggestions(data.results || []);
          }
        } catch (e) {
          console.warn("Error fetching suggestions:", e);
        }
      } else {
        setAddressSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [addressSearchQuery, showSuggestions]);

  const handleSelectSuggestion = (suggestion: any) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    if (!isNaN(lat) && !isNaN(lng)) {
      setCustomerLat(lat);
      setCustomerLng(lng);
    }
    setCustomerAddress(suggestion.display_name);
    setAddressSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
    onShowToast("ค้นหาตำแหน่งสำเร็จ", "success");
  };

  const handleReverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          setCustomerAddress(data.address);
          return;
        }
      }
      setCustomerAddress(`พิกัดละติจูด ${lat.toFixed(5)}, ลองจิจูด ${lng.toFixed(5)}`);
    } catch (e) {
      setCustomerAddress(`พิกัดละติจูด ${lat.toFixed(5)}, ลองจิจูด ${lng.toFixed(5)}`);
    }
  };

  const handleMapLocationChange = (lat: number, lng: number) => {
    setCustomerLat(lat);
    setCustomerLng(lng);
    handleReverseGeocode(lat, lng);
  };

  const handleSearchAddress = async () => {
    if (!addressSearchQuery.trim()) return;
    setIsSearchingAddress(true);
    try {
      const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(addressSearchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        const results = data.results || [];
        if (results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lng = parseFloat(results[0].lon);
          if (!isNaN(lat) && !isNaN(lng)) {
            setCustomerLat(lat);
            setCustomerLng(lng);
          }
          setCustomerAddress(results[0].display_name);
          onShowToast("ค้นหาตำแหน่งสำเร็จ", "success");
          return;
        }
      }
      onShowToast("ไม่พบตำแหน่งจากคำค้นหาดังกล่าว", "error");
    } catch (e) {
      onShowToast("ค้นหาตำแหน่งล้มเหลว", "error");
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchServices();
    fetchStaff();
    if (currentUser) {
      fetchActiveBooking();
      fetchNotifications();
    }
  }, [currentUser]);

  // Set initial location from current location or user object
  useEffect(() => {
    if (currentUser) {
      // Set to mock data temporarily until GPS loads
      setCustomerLat(currentUser.Latitude || 13.743122);
      setCustomerLng(currentUser.Longitude || 100.588421);
      if (currentUser.Address) {
        setCustomerAddress(currentUser.Address);
      }
      
      // Auto-fetch real location on mount
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCustomerLat(position.coords.latitude);
            setCustomerLng(position.coords.longitude);
            handleReverseGeocode(position.coords.latitude, position.coords.longitude);
          },
          (error) => {
            console.warn("Auto GPS error (can be ignored in preview):", error.message);
          },
          { enableHighAccuracy: true }
        );
      }
    }
  }, [currentUser]);

  // Function to use real GPS location with full loading indicator and accuracy
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      onShowToast("อุปกรณ์หรือเบราว์เซอร์นี้ไม่รองรับการระบุพิกัด GPS", "error");
      return;
    }
    setIsLoadingGPS(true);
    onShowToast("🛰️ กำลังค้นหาตำแหน่งปัจจุบันจากสัญญาณ GPS...", "info");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCustomerLat(lat);
        setCustomerLng(lng);
        handleReverseGeocode(lat, lng);
        setIsLoadingGPS(false);
        onShowToast("✅ อัปเดตและปักหมุดตำแหน่งปัจจุบันจาก GPS สำเร็จแล้ว", "success");
      },
      (error) => {
        console.warn("Geolocation error:", error);
        setIsLoadingGPS(false);
        onShowToast("⚠️ ไม่สามารถดึงตำแหน่ง GPS ได้ กรุณาอนุญาตสิทธิ์การเข้าถึงตำแหน่งหรือคลิกปักหมุดบนแผนที่", "error");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Set up polling for active booking status updates & notifications & live staff status
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStaff();
      if (currentUser) {
        fetchActiveBooking();
        fetchNotifications();
        // Hit match updates logic on server to advance offer queues
        fetch('/api/bookings/match-updates').then(() => {}).catch(() => {});
      }
    }, 4000); // Poll every 4 seconds

    return () => clearInterval(interval);
  }, [currentUser, activeBooking?.Status]);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(data.filter((s: Service) => s.Active === 'ON'));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      setAllStaff(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/notifications/${currentUser.UserID}`);
      const data = await res.json();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchActiveBooking = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/bookings');
      const bookings = await res.json();
      // Get the latest pending/active booking for this customer
      const customerBookings = bookings.filter((b: any) => 
        b.CustomerID === currentUser.UserID && 
        b.Status !== 'Completed' && 
        b.Status !== 'Cancel' &&
        b.Status !== 'Cancelled'
      );
      
      const latest = customerBookings[customerBookings.length - 1] || null;
      
      const allHistory = bookings.filter((b: any) => 
        b.CustomerID === currentUser.UserID && 
        (b.Status === 'Completed' || b.Status === 'Cancel' || b.Status === 'Cancelled')
      ).sort((a: any, b: any) => new Date(b.CreatedDate).getTime() - new Date(a.CreatedDate).getTime());
      
      setHistoryBookings(allHistory);
      
      // If booking was completed/cancelled compared to previous state, alert user
      if (activeBooking && !latest) {
        // Find if latest completed booking exists
        const lastFinished = bookings.filter((b: any) => 
          b.CustomerID === currentUser.UserID && 
          b.BookingID === activeBooking.BookingID
        )[0];
        
        if (lastFinished) {
          if (lastFinished.Status === 'Completed') {
            onShowToast("💆 การจองบริการนวดเสร็จสมบูรณ์เรียบร้อยแล้วค่ะ!", "success");
            setBookingToReview(lastFinished);
            setShowReviewModal(true);
            if (onPlayNotificationSound) onPlayNotificationSound();
          } else if (lastFinished.Status === 'Cancel' || lastFinished.Status === 'Cancelled') {
            onShowToast("⚠️ การจองนวดของคุณถูกยกเลิกแล้ว", "info");
          }
        }
      }
      
      // Sound alert on status change
      if (latest && activeBooking && latest.Status !== activeBooking.Status) {
        if (latest.Status === 'Accepted') {
          onShowToast(`🟢 พี่ ${latest.StaffNickname} รับงานนวดของคุณแล้ว!`, "success");
        } else if (latest.Status === 'Working') {
          onShowToast("🛵 พนักงานเริ่มงานนวดหรือกำลังเดินทางมายังบ้านของคุณ", "info");
        }
        if (onPlayNotificationSound) onPlayNotificationSound();
      }

      setActiveBooking(latest);
    } catch (e) {
      console.error(e);
    }
  };

  // Obtain coordinates using Web Geolocation API
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      onShowToast("เบราว์เซอร์ของคุณไม่สนับสนุน Geolocation API", "error");
      return;
    }

    setIsLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCustomerLat(position.coords.latitude);
        setCustomerLng(position.coords.longitude);
        handleReverseGeocode(position.coords.latitude, position.coords.longitude);
        setIsLoadingGPS(false);
        onShowToast("อัปเดตตำแหน่งของคุณจาก GPS แล้ว", "success");
      },
      (error) => {
        setIsLoadingGPS(false);
        onShowToast("ไม่สามารถเข้าถึงตำแหน่ง GPS ได้ชั่วคราว", "error");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Submit Booking reservation
  const handleConfirmBooking = async () => {
    if (!currentUser) {
      onShowToast("กรุณาเข้าสู่ระบบก่อนทำการจองบริการนวด", "error");
      return;
    }
    if (!selectedService) {
      onShowToast("กรุณาเลือกบริการนวดที่ท่านต้องการก่อนค่ะ", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: currentUser.UserID,
          serviceId: selectedService.ServiceID,
          customerAddress: customerAddressDetail ? `${customerAddress} (รายละเอียดเพิ่มเติม: ${customerAddressDetail})` : customerAddress,
          customerLatitude: customerLat,
          customerLongitude: customerLng,
          preferredStaffId: selectedStaffForBooking?.StaffID || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "จองบริการนวดล้มเหลว");
      }

      onShowToast("ส่งคำขอจองบริการนวดสำเร็จ! กำลังติดต่อค้นหาพนักงานที่อยู่ใกล้ที่สุด...", "success");
      setActiveBooking(data.booking);
      setActiveTab('booking');
      setSelectedStaffProfile(null); // Close the staff profile modal/overlay
      setSelectedStaffForBooking(null); // Reset selection
      fetchStaff(); // refresh locations
      setTimeout(() => {
        const root = document.getElementById('customer-view-root');
        if (root) {
          root.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (e: any) {
      onShowToast(e.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Review rating feedback
  const handleSubmitReview = async () => {
    if (!bookingToReview) return;
    
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingToReview.BookingID,
          customerId: bookingToReview.CustomerID,
          staffId: bookingToReview.StaffID,
          score: reviewScore,
          comment: reviewComment
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }

      onShowToast("ขอบคุณสําหรับการให้คะแนนรีวิวค่ะ! ความเห็นของคุณช่วยเพิ่มคุณภาพการให้บริการอย่างดีเยี่ยม", "success");
      setShowReviewModal(false);
      setBookingToReview(null);
      setReviewComment("");
      setReviewScore(5);
      fetchStaff(); // update ratings
      fetchActiveBooking(); // refresh history with review info
    } catch (e: any) {
      onShowToast(e.message, "error");
    }
  };

  // Calculate distance between two points
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return parseFloat((R * c).toFixed(1));
  };

  // Find eligible online staff to show on map and in list, sorted by distance
  const activeOnlineStaff = allStaff
    .filter((s) => s.Available === 'ON' && s.VerifyStatus !== 'Reject')
    .map((s) => {
      const staffLat = typeof s.CurrentLatitude === 'number' ? s.CurrentLatitude : 13.7563;
      const staffLng = typeof s.CurrentLongitude === 'number' ? s.CurrentLongitude : 100.5018;
      const distance = getDistance(customerLat, customerLng, staffLat, staffLng);
      const isWithinRadius = distance <= (s.MaxJobDistance || settings.searchRadius || 50);
      return {
        ...s,
        CurrentLatitude: staffLat,
        CurrentLongitude: staffLng,
        distance,
        isWithinRadius
      };
    })
    .sort((a, b) => a.distance - b.distance);

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-10" id="customer-view-root">
      {/* Customer Tabs */}
      <div className="bg-white border border-slate-100 rounded-2xl p-1.5 flex shadow-sm">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex-1 text-[10px] sm:text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'home' 
              ? 'bg-sky-500 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          จองนวด
        </button>
        <button
          onClick={() => setActiveTab('booking')}
          className={`flex-1 text-[10px] sm:text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer relative ${
            activeTab === 'booking' 
              ? 'bg-sky-500 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          กำลังจอง
          {activeBooking && (
            <span className="absolute top-1.5 right-4 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 text-[10px] sm:text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'history' 
              ? 'bg-sky-500 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          ประวัติ
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 text-[10px] sm:text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'profile' 
              ? 'bg-sky-500 text-white shadow-md' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          โปรไฟล์
        </button>
      </div>

      {/* Booking Progress Tracker / Active Booking State Card */}
      {activeTab === 'booking' && activeBooking && (
        <div className="bg-white border border-slate-200 text-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full">
              ติดตามสถานะงานนวดสด
            </span>
            <span className="text-xs font-mono text-slate-400">#ID: {activeBooking.BookingID}</span>
          </div>

          <h3 className="text-lg font-bold mt-4 text-slate-900">
            {activeBooking.Status === 'Waiting' && '⏳ กำลังค้นหาพนักงานนวดนวดใกล้เคียง...'}
            {activeBooking.Status === 'Accepted' && '🛵 หมอนวดตอบรับแล้ว กำลังเตรียมตัวเดินทาง...'}
            {activeBooking.Status === 'Working' && '💆 พนักงานมาถึงแล้ว กำลังเริ่มนวดให้บริการ...'}
            {activeBooking.Status === 'Completed' && '🎉 การให้บริการเสร็จสิ้น ขอบคุณค่ะ'}
          </h3>

          {/* Map showing route */}
          <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <InteractiveMap 
              customerLat={customerLat}
              customerLng={customerLng}
              staffPins={activeOnlineStaff}
              activeBooking={{
                status: activeBooking.Status,
                staffLat: activeBooking.StaffID !== 'none' 
                  ? allStaff.find(s => s.StaffID === activeBooking.StaffID)?.CurrentLatitude 
                  : undefined,
                staffLng: activeBooking.StaffID !== 'none' 
                  ? allStaff.find(s => s.StaffID === activeBooking.StaffID)?.CurrentLongitude 
                  : undefined
              }}
              height="h-[200px]"
            />
          </div>

          {/* Stepper Progress Visualizer */}
          <div className="mt-6 grid grid-cols-4 gap-1 relative text-center">
            <div className="absolute top-1.5 left-6 right-6 h-[2px] bg-slate-200 z-0" />
            <div 
              className="absolute top-1.5 left-6 h-[2px] bg-sky-500 z-0 transition-all duration-700" 
              style={{
                width: activeBooking.Status === 'Waiting' ? '12%' : 
                       activeBooking.Status === 'Accepted' ? '38%' : 
                       activeBooking.Status === 'Working' ? '75%' : '100%'
              }}
            />

            <div className="z-10 flex flex-col items-center">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                activeBooking.Status === 'Waiting' ? 'bg-amber-500 text-white animate-pulse' : 'bg-sky-500 text-white'
              }`}>1</div>
              <span className="text-[10px] font-bold text-slate-500 mt-1">จองบริการ</span>
            </div>
            
            <div className="z-10 flex flex-col items-center">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                activeBooking.Status === 'Waiting' ? 'bg-slate-200 text-slate-500' :
                activeBooking.Status === 'Accepted' ? 'bg-amber-500 text-white animate-pulse' : 'bg-sky-500 text-white'
              }`}>2</div>
              <span className="text-[10px] font-bold text-slate-500 mt-1">รับงาน</span>
            </div>

            <div className="z-10 flex flex-col items-center">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                (activeBooking.Status === 'Waiting' || activeBooking.Status === 'Accepted') ? 'bg-slate-200 text-slate-500' :
                activeBooking.Status === 'Working' ? 'bg-amber-500 text-white animate-pulse' : 'bg-sky-500 text-white'
              }`}>3</div>
              <span className="text-[10px] font-bold text-slate-500 mt-1">เดินทาง/นวด</span>
            </div>

            <div className="z-10 flex flex-col items-center">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                activeBooking.Status !== 'Completed' ? 'bg-slate-200 text-slate-500' : 'bg-sky-500 text-white'
              }`}>4</div>
              <span className="text-[10px] font-bold text-slate-500 mt-1">เสร็จงาน</span>
            </div>
          </div>

          {/* Assigned Staff Mini Card */}
          {activeBooking.StaffID !== 'none' && (
            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={activeBooking.StaffProfileImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120"} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-sky-500" 
                  alt="Staff" 
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm">พี่{activeBooking.StaffNickname}</span>
                    <span className="bg-sky-100 text-sky-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded">มืออาชีพ</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">เบอร์ติดต่อ: {activeBooking.StaffPhone}</p>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-slate-500 text-xs">ยอดรวมบริการ</span>
                <p className="text-base font-extrabold text-sky-600">฿{activeBooking.TotalPrice}</p>
              </div>
            </div>
          )}

          {/* Cancel button if still waiting */}
          {activeBooking.Status === 'Waiting' && (
            <button
              onClick={async () => {
                // Use a simple immediate cancel since window.confirm can be blocked by iframe sandboxes
                try {
                  await fetch(`/api/bookings/${activeBooking.BookingID}/action`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'cancel' })
                  });
                  onShowToast("ยกเลิกรายการเรียกนวดเรียบร้อยแล้ว", "info");
                  setActiveBooking(null);
                } catch (e) {
                  console.error(e);
                }
              }}
              className="mt-4 w-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold py-2.5 rounded-xl border border-rose-200 transition-colors"
            >
              ❌ ยกเลิกการจองนวดนี้
            </button>
          )}
        </div>
      )}

      {/* Booking empty state */}
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
      {activeTab === 'home' && (
        <div className="space-y-6">
          
          {/* STEP 1: Live Interactive Map of Online Therapists */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="text-xl">🗺️</span>
                  แผนที่พนักงานนวดออนไลน์สด
                </h3>
                <p className="text-[11px] text-slate-400 font-bold">พิกัดหมอนวดที่เปิดสถานะออนไลน์พร้อมรับงาน</p>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {activeOnlineStaff.length} คนออนไลน์
              </span>
            </div>

            {/* Interactive Map */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
              <InteractiveMap 
                customerLat={customerLat}
                customerLng={customerLng}
                staffPins={activeOnlineStaff.map(s => ({
                  id: s.StaffID,
                  nickname: s.Nickname,
                  lat: s.CurrentLatitude,
                  lng: s.CurrentLongitude,
                  available: s.Available,
                  status: s.VerifyStatus
                }))}
                height="h-[220px]"
                onLocationChange={handleMapLocationChange}
                onUseGPS={handleUseGPS}
                isLoadingGPS={isLoadingGPS}
              />
            </div>

            {/* Quick GPS Location Bar */}
            <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 overflow-hidden">
                <MapPin className="w-4 h-4 text-sky-500 shrink-0" />
                <span className="text-[11px] text-slate-600 font-semibold truncate">
                  {customerAddress || `พิกัด ${customerLat.toFixed(4)}, ${customerLng.toFixed(4)}`}
                </span>
              </div>
              <button
                onClick={handleUseGPS}
                disabled={isLoadingGPS}
                className="text-[10px] font-black text-sky-600 bg-sky-50 hover:bg-sky-100 border border-sky-200/50 px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Compass className={`w-3 h-3 ${isLoadingGPS ? 'animate-spin' : ''}`} />
                {isLoadingGPS ? 'ค้นหา...' : 'อัปเดตพิกัด'}
              </button>
            </div>
          </div>

          {/* STEP 2: Available Massage Therapists List */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="text-xl">👩‍⚕️</span>
                  พี่หมอนวดที่พร้อมให้บริการขณะนี้
                </h3>
                <p className="text-[11px] text-slate-400 font-bold">คลิกที่พี่หมอนวดเพื่อเลือกรายการบริการนวดและจองบริการได้ทันทีค่ะ</p>
              </div>
              <span className="text-[10px] font-extrabold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100 flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                {activeOnlineStaff.length} คนพร้อมรับงาน
              </span>
            </div>

            {/* Therapists list container */}
            <div className="space-y-3">
              {activeOnlineStaff.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-600 mt-2">ไม่มีหมอนวดออนไลน์ ณ เวลานี้</p>
                  <p className="text-[10px] text-slate-400 mt-1">เมื่อพนักงานสลับเปิดออนไลน์ ระบบจะแสดงพิกัดและรายชื่อทันทีค่ะ</p>
                </div>
              ) : (
                activeOnlineStaff.map((staff) => {
                  return (
                    <div 
                      key={staff.StaffID}
                      onClick={async () => {
                        setSelectedStaffProfile(staff);
                        setSelectedStaffForBooking(staff);
                        try {
                          const res = await fetch(`/api/staff/${staff.StaffID}/reviews`);
                          const data = await res.json();
                          setSelectedStaffReviews(data);
                        } catch (e) {
                          console.error('Failed to fetch reviews', e);
                        }
                      }}
                      className="border border-slate-100 hover:border-sky-500 hover:shadow-md rounded-2xl p-4 flex flex-col gap-3 bg-white transition-all cursor-pointer group hover:-translate-y-0.5 duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img 
                              src={staff.ProfileImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120"} 
                              className="w-12 h-12 rounded-full object-cover border border-slate-100 group-hover:border-sky-200 transition-colors" 
                              alt={staff.Nickname} 
                            />
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" title="ออนไลน์" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800 text-sm group-hover:text-sky-700 transition-colors">พี่{staff.Nickname}</span>
                              <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-1.5 py-0.5 rounded-full">ออนไลน์</span>
                              <div className="flex items-center text-amber-500 font-extrabold text-xs ml-1">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span className="ml-0.5">{staff.Rating}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-400">
                              <span>เพศ: {staff.Gender === 'Female' ? 'หญิง' : 'ชาย'}</span>
                              <span>•</span>
                              <span>อายุ: {staff.Age} ปี</span>
                              <span>•</span>
                              <span>ประสบการณ์: {staff.Experience} ปี</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end">
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold group-hover:bg-sky-50 group-hover:text-sky-700 transition-colors">
                            📍 {staff.distance} กม.
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold mt-1">
                            {staff.isWithinRadius ? 'อยู่ในเขตให้บริการ' : 'นอกเขตให้บริการ'}
                          </span>
                        </div>
                      </div>

                      {/* Bio preview */}
                      {staff.Description && (
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl group-hover:bg-slate-100/50 transition-colors line-clamp-2">
                          💬 {staff.Description}
                        </p>
                      )}

                      {/* Action button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStaffProfile(staff);
                          setSelectedStaffForBooking(staff);
                        }}
                        className="w-full text-[11px] font-black text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/30 py-2.5 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1"
                      >
                        💆 ดูโปรไฟล์ & เลือกบริการจองนวด
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Full Staff Profile Detail & Booking Checkout Modal */}
      {selectedStaffProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] sm:max-h-[85vh] overflow-y-auto shadow-2xl animate-slide-up">
            
            {/* Header profile banner */}
            <div className="relative h-32 bg-slate-100">
              <button 
                onClick={() => setSelectedStaffProfile(null)}
                className="absolute top-4 right-4 bg-slate-950/60 hover:bg-slate-950/80 text-white p-1.5 rounded-full z-10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-40" />
              <img 
                src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=500&auto=format&fit=crop&q=60" 
                className="w-full h-full object-cover" 
                alt="Banner" 
              />
            </div>

            {/* Profile Avatar & Quick info */}
            <div className="px-6 pb-6 relative">
              <div className="flex justify-between items-end -mt-10 mb-4">
                <img 
                  src={selectedStaffProfile.ProfileImage || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"} 
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md bg-white relative z-10" 
                  alt="Avatar" 
                />
                <div className="flex gap-1.5">
                  <span className="bg-sky-50 text-sky-800 border border-sky-100 text-[10px] font-extrabold px-3 py-1 rounded-full">
                    ผ่านการตรวจสอบ
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">พี่{selectedStaffProfile.Nickname}</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold text-slate-500">
                    <span>เพศ: {selectedStaffProfile.Gender === 'Female' ? 'หญิง' : 'ชาย'}</span>
                    <span>•</span>
                    <span>อายุ: {selectedStaffProfile.Age} ปี</span>
                    <span>•</span>
                    <span>ประสบการณ์: {selectedStaffProfile.Experience} ปี</span>
                  </div>
                </div>

                {/* Rating Stats block */}
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl text-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">คะแนนสะสม</span>
                    <div className="flex items-center justify-center text-amber-500 font-extrabold text-sm mt-0.5">
                      <Star className="w-4 h-4 fill-current mr-0.5" />
                      <span>{selectedStaffProfile.Rating}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">รีวิวรวม</span>
                    <span className="text-sm font-extrabold text-slate-700 block mt-0.5">{selectedStaffProfile.ReviewCount} ครั้ง</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">งานสำเร็จ</span>
                    <span className="text-sm font-extrabold text-slate-700 block mt-0.5">{selectedStaffProfile.TotalJobs || 0} งาน</span>
                  </div>
                </div>

                {/* Description Bio */}
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">คำอธิบายประวัติพนักงาน</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {selectedStaffProfile.Description || 'พนักงานนวดผู้ผ่านใบอนุญาต นวดแก้อาการและนวดอโรมาผ่อนคลาย ยินดีดูแลคุณลูกค้าถึงบ้านค่ะ'}
                  </p>
                </div>

                {/* Credentials list */}
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
                </div>

                {/* CHOOSE SERVICE SECTION INSIDE PROFILE */}
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-white bg-sky-500 w-5 h-5 rounded-full flex items-center justify-center">1</span>
                    <h4 className="text-sm font-black text-slate-800">เลือกรายการบริการนวดที่ต้องการ</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    {services
                      .filter((s) => !selectedStaffProfile.OfferedServices || selectedStaffProfile.OfferedServices.includes(s.ServiceID))
                      .map((service) => {
                      const isSelected = selectedService?.ServiceID === service.ServiceID;
                      const hasSufficientCredit = selectedStaffProfile.Credit >= service.CreditRequired;

                      return (
                        <div
                          key={service.ServiceID}
                          onClick={() => {
                            if (!hasSufficientCredit) {
                              onShowToast(`พี่ ${selectedStaffProfile.Nickname} มีเครดิตไม่เพียงพอสำหรับบริการนี้`, "error");
                              return;
                            }
                            setSelectedService(service);
                          }}
                          className={`border p-3.5 rounded-2xl cursor-pointer transition-all duration-200 flex items-start justify-between relative overflow-hidden group ${
                            isSelected 
                              ? 'border-sky-500 bg-sky-50/40 ring-1 ring-sky-500/10' 
                              : !hasSufficientCredit
                                ? 'border-slate-100 bg-slate-50/50 opacity-50 cursor-not-allowed'
                                : 'border-slate-100 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="space-y-1 max-w-[75%]">
                            <span className="text-[9px] font-extrabold uppercase tracking-wide bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                              {service.Duration} นาที
                            </span>
                            <h4 className="font-bold text-slate-800 text-xs mt-1.5">{service.ServiceName}</h4>
                            <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">{service.Detail}</p>
                          </div>

                          <div className="text-right flex flex-col justify-between h-full min-h-[45px] shrink-0">
                            <span className="text-base font-black text-sky-600">฿{service.Price}</span>
                            {!hasSufficientCredit && (
                              <span className="text-[8px] bg-red-50 text-red-600 font-extrabold p-0.5 rounded text-center mt-1">
                                เครดิตพี่นวดไม่พอ
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ADDRESS & MAP SECTION INSIDE PROFILE */}
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-white bg-sky-500 w-5 h-5 rounded-full flex items-center justify-center">2</span>
                      <h4 className="text-sm font-black text-slate-800">ระบุตำแหน่งสถานที่นวดของคุณ</h4>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      พิกัด: {customerLat.toFixed(4)}, {customerLng.toFixed(4)}
                    </span>
                  </div>

                  {/* PROMINENT LARGE CURRENT LOCATION (GPS) BUTTON */}
                  <button
                    type="button"
                    onClick={handleUseGPS}
                    disabled={isLoadingGPS}
                    className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm transition-all duration-200 shadow-md flex items-center justify-between group cursor-pointer border ${
                      isLoadingGPS 
                        ? 'bg-sky-100 text-sky-800 border-sky-300 animate-pulse cursor-wait' 
                        : 'bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white border-transparent hover:shadow-lg active:scale-[0.99]'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner">
                        <Compass className={`w-6 h-6 text-white ${isLoadingGPS ? 'animate-spin' : 'group-hover:rotate-45 transition-transform duration-300'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm sm:text-base font-black tracking-wide">
                            {isLoadingGPS ? 'กำลังค้นหาสัญญาณดาวเทียม GPS...' : '📍 ใช้ตำแหน่งปัจจุบันของฉัน (GPS)'}
                          </span>
                          <span className="bg-white/25 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                            ด่วน & แม่นยำ
                          </span>
                        </div>
                        <p className="text-[11px] text-sky-100 font-medium mt-0.5">
                          แตะปุ่มนี้เพื่อดึงพิกัดที่อยู่ปัจจุบันและคำนวณระยะทางทันที
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-xl text-xs font-bold text-white shrink-0 group-hover:bg-white/30 transition-colors">
                      <span>ระบุพิกัด</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Search box on Map */}
                  <div className="relative">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={addressSearchQuery}
                        onChange={(e) => {
                          setAddressSearchQuery(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchAddress()}
                        placeholder="ค้นหาสถานที่บนแผนที่ เช่น สยามพารากอน, ซอยสุขุมวิท 21..."
                        className="flex-1 text-xs font-semibold border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      />
                      <button
                        onClick={handleSearchAddress}
                        disabled={isSearchingAddress}
                        className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl disabled:opacity-50 transition-colors shrink-0"
                      >
                        {isSearchingAddress ? 'ค้นหา...' : '🔍 ค้นหา'}
                      </button>
                    </div>
                    {showSuggestions && addressSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {addressSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className="p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer text-xs text-slate-700"
                          >
                            <div className="font-semibold">{suggestion.display_name.split(',')[0]}</div>
                            <div className="text-[10px] text-slate-500 truncate">{suggestion.display_name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Interactive map visualization */}
                  <div className="space-y-2">
                    <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                      <InteractiveMap 
                        customerLat={customerLat}
                        customerLng={customerLng}
                        staffPins={[selectedStaffProfile]}
                        height="h-[250px]"
                        onLocationChange={handleMapLocationChange}
                        onUseGPS={handleUseGPS}
                        isLoadingGPS={isLoadingGPS}
                      />
                    </div>
                  </div>

                  {/* Address Editable Box */}
                  <div className="space-y-2 mt-3">
                    <textarea
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="ระบุที่อยู่จัดส่ง แขวง เขต..."
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 min-h-[55px]"
                    />
                    <input
                      type="text"
                      value={customerAddressDetail}
                      onChange={(e) => setCustomerAddressDetail(e.target.value)}
                      placeholder="พิมพ์ที่อยู่เพิ่มเติม (ไม่บังคับ) เช่น ชั้น, ห้อง, ตึก..."
                      className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* BOOKING DETAILS & CONFIRMATION ACTION */}
                {selectedService && (
                  <div className="border-t border-slate-100 pt-5 space-y-4 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-white bg-sky-500 w-5 h-5 rounded-full flex items-center justify-center">3</span>
                      <h4 className="text-sm font-black text-slate-800">สรุปยอดสุทธิและส่งคำขอจอง</h4>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5 text-xs text-slate-600">
                      <div className="flex justify-between font-medium">
                        <span>ค่าบริการนวด ({selectedService.ServiceName})</span>
                        <span className="font-bold text-slate-800">฿{selectedService.Price}</span>
                      </div>
                      
                      {(() => {
                        const distance = getDistance(customerLat, customerLng, selectedStaffProfile.CurrentLatitude, selectedStaffProfile.CurrentLongitude);
                        let travelFee = parseFloat((distance * settings.travelFeePerKm).toFixed(2));
                        let feeFormulaText = `ค่าเดินทางคิดกิโลเมตรละ ฿${settings.travelFeePerKm}`;

                        if (settings.travelFeeTiers && settings.travelFeeTiers.length > 0) {
                          const sortedTiers = [...settings.travelFeeTiers].sort((a, b) => a.maxKm - b.maxKm);
                          let matchedTier = false;
                          for (const tier of sortedTiers) {
                            if (distance >= tier.minKm && distance <= tier.maxKm) {
                              travelFee = tier.fee;
                              feeFormulaText = `คิดค่าเดินทางตามช่วงระยะทาง ${tier.minKm}-${tier.maxKm} กม. (฿${tier.fee})`;
                              matchedTier = true;
                              break;
                            }
                          }
                          // If distance is higher than highest tier, fallback to perKm calculation
                          if (!matchedTier && sortedTiers.length > 0 && distance > sortedTiers[sortedTiers.length - 1].maxKm) {
                            feeFormulaText = `ระยะทางเกินกำหนด คิดค่าเดินทางกิโลเมตรละ ฿${settings.travelFeePerKm}`;
                          }
                        }

                        const totalPayment = selectedService.Price + travelFee;

                        return (
                          <>
                            <div className="flex justify-between font-medium">
                              <span>ค่าเดินทางจัดส่ง (ระยะทาง {distance.toFixed(2)} กม.)</span>
                              <span className="font-bold text-slate-800">฿{travelFee.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-slate-200/60 my-2 pt-2.5 flex justify-between text-sm font-black text-slate-900">
                              <span className="text-sky-700">ยอดชำระสุทธิทั้งหมด</span>
                              <span className="text-sky-600 font-black text-base">฿{totalPayment.toFixed(2)}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                              * {feeFormulaText} จากตำแหน่ง พี่{selectedStaffProfile.Nickname} ณ ปัจจุบัน จนถึงสถานที่ของคุณ
                            </p>
                          </>
                        );
                      })()}
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleConfirmBooking}
                      disabled={isLoading}
                      className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-100 disabled:text-slate-400 text-white font-extrabold text-sm py-4 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      {isLoading 
                        ? 'กำลังจองบริการและส่งงานนวด...' 
                        : `ยืนยันเรียก พี่${selectedStaffProfile.Nickname} มานวดให้คุณ`
                      }
                    </button>
                  </div>
                )}

                {/* Close Button at bottom */}
                <button
                  onClick={() => setSelectedStaffProfile(null)}
                  className="w-full border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold py-3.5 rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  ย้อนกลับไปหน้าก่อนหน้า
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Review & Feedback Rating Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scale-up text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-sky-50 flex items-center justify-center mx-auto">
              <Award className="w-8 h-8 text-sky-500" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">ให้คะแนนความพึงพอใจการนวด</h3>
              <p className="text-xs text-slate-500">กรุณาให้เรตติ้งเพื่อเป็นขวัญกำลังใจในการพัฒนาบริการของพี่หมอนวด</p>
            </div>

            {/* Stars Selector */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewScore(star)}
                  className="p-1 focus:outline-none transition-transform active:scale-125 cursor-pointer"
                >
                  <Star className={`w-10 h-10 ${
                    star <= reviewScore ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                  }`} />
                </button>
              ))}
            </div>

            {/* Comments Form */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ความคิดเห็นเพิ่มเติม</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="เขียนความพึงพอใจของคุณ เช่น นวดดีแก้อาการตรงจุด มารยาทเรียบร้อยดีมาก..."
                className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 min-h-[80px]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setBookingToReview(null);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-2xl text-xs transition-colors cursor-pointer"
              >
                ข้ามการประเมิน
              </button>
              <button
                onClick={handleSubmitReview}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-black py-3.5 rounded-2xl text-xs shadow-md transition-colors cursor-pointer"
              >
                ส่งคะแนนประเมิน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History view */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-800">ประวัติการจอง</h2>
          
          {historyBookings.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center shadow-sm">
              <span className="text-3xl mb-3 block">🕰️</span>
              <p className="text-sm font-bold text-slate-500">ยังไม่มีประวัติการจอง</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyBookings.map((b, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">#ID: {b.BookingID}</span>
                      <h4 className="font-bold text-slate-800">{b.ServiceName}</h4>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      b.Status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {b.Status === 'Completed' ? 'สำเร็จ' : 'ยกเลิก'}
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-500 space-y-1 mb-3">
                    <p>วันที่: {b.BookingDate} เวลา {b.BookingTime}</p>
                    {b.StaffID !== 'none' && (
                      <p>พนักงาน: พี่{b.StaffNickname}</p>
                    )}
                    <p className="font-semibold text-sky-600 mt-2">ยอดรวม: ฿{b.TotalPrice}</p>
                  </div>
                  
                  {b.CancellationReason && (
                    <div className="bg-rose-50 border border-rose-100 rounded-lg p-2.5 text-[10px] text-rose-600 font-medium">
                      หมายเหตุ: {b.CancellationReason}
                    </div>
                  )}

                  {/* Review Section for Completed Bookings */}
                  {b.Status === 'Completed' && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      {b.ReviewScore ? (
                        <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 space-y-1 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-amber-800">⭐ คะแนนรีวิวที่คุณให้</span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star 
                                  key={s} 
                                  className={`w-3.5 h-3.5 ${
                                    s <= b.ReviewScore ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                  }`} 
                                />
                              ))}
                              <span className="text-xs font-bold text-amber-900 ml-1">({b.ReviewScore}/5)</span>
                            </div>
                          </div>
                          {b.ReviewComment && (
                            <p className="text-xs text-slate-600 italic">"{b.ReviewComment}"</p>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setBookingToReview(b);
                            setReviewScore(5);
                            setReviewComment("");
                            setShowReviewModal(true);
                          }}
                          className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span>ให้คะแนนและเขียนรีวิวบริการนี้</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profile view */}
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
                <div className="w-20 h-20 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center text-3xl font-black shadow-sm mb-4">{currentUser.Name ? currentUser.Name[0] : "ล"}</div>
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
      )}

    </div>
  );
}
