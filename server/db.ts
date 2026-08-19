import fs from 'fs';
import path from 'path';
import { User, Staff, Service, Booking, CreditTransaction, Review, Notification, AppSettings } from '../src/types';

const DB_PATH = path.join(process.cwd(), 'server', 'db.json');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export interface DatabaseSchema {
  users: User[];
  staff: Staff[];
  services: Service[];
  bookings: Booking[];
  transactions: CreditTransaction[];
  reviews: Review[];
  notifications: Notification[];
  settings: AppSettings;
}

const defaultSettings: AppSettings = {
  companyName: "SabaiDee Massage",
  logo: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=120&auto=format&fit=crop&q=60",
  themeColor: "#10b981", // Emerald Green (Grab style)
  travelFeePerKm: 15,
  travelFeeTiers: [
    { minKm: 0, maxKm: 3, fee: 0 },
    { minKm: 3, maxKm: 10, fee: 150 },
    { minKm: 10, maxKm: 15, fee: 200 }
  ],
  commissionRate: 15, // 15%
  minCredit: 200,
  searchRadius: 15, // 15 km
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
};

const defaultServices: Service[] = [
  {
    ServiceID: "S001",
    ServiceName: "นวดผ่อนคลาย (Relaxing Massage)",
    Detail: "นวดผ่อนคลายความเครียดสะสม คลายความเมื่อยล้าทั่วร่างกาย ปรับสมดุลให้ร่างกายเบาสบาย",
    Duration: 120,
    Price: 798,
    CreditRequired: 398,
    Active: 'ON',
    SortOrder: 1
  },
  {
    ServiceID: "S002",
    ServiceName: "นวดแก้อาการ (Therapeutic Massage)",
    Detail: "นวดบำบัดรักษาอาการปวดเมื่อยเฉพาะจุด แก้เส้นตึง พังผืดเกาะ คอบ่าไหล่ ออฟฟิศซินโดรม",
    Duration: 120,
    Price: 798,
    CreditRequired: 398,
    Active: 'ON',
    SortOrder: 2
  },
  {
    ServiceID: "S003",
    ServiceName: "นวดแผนไทย (Thai Massage)",
    Detail: "นวดแผนโบราณ กดจุด ยืดเหยียดกล้ามเนื้อ กระตุ้นการไหลเวียนเลือด ทำให้ร่างกายสดชื่น",
    Duration: 120,
    Price: 798,
    CreditRequired: 398,
    Active: 'ON',
    SortOrder: 3
  }
];

const defaultUsers: User[] = [
  {
    UserID: "U001",
    Name: "สมชาย ยิ่งดี (แอดมิน)",
    Phone: "0812345678",
    PasswordHash: "admin123", // For mock DB, simple match
    Email: "admin@sabaidee.com",
    Address: "123/45 ถนนสุขุมวิท เขตวัฒนา กรุงเทพฯ",
    Province: "กรุงเทพมหานคร",
    District: "เขตวัฒนา",
    SubDistrict: "คลองเตยเหนือ",
    Latitude: 13.736717,
    Longitude: 100.560544,
    ProfileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60",
    Role: "Admin",
    Status: "Active",
    CreatedDate: "2026-01-01T08:00:00Z"
  },
  // Staff Users
  {
    UserID: "U002",
    Name: "วรรณภา แสนดี (พี่นง)",
    Phone: "0823456789",
    PasswordHash: "staff123",
    Email: "nong@sabaidee.com",
    Address: "88/12 ซอยอารีย์ ถนนพหลโยธิน เขตพญาไท กรุงเทพฯ",
    Province: "กรุงเทพมหานคร",
    District: "เขตพญาไท",
    SubDistrict: "สามเสนใน",
    Latitude: 13.779743,
    Longitude: 100.544773,
    ProfileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60",
    Role: "Staff",
    Status: "Active",
    CreatedDate: "2026-03-15T09:30:00Z"
  },
  {
    UserID: "U003",
    Name: "กรรณิการ์ จิตใจงาม (พี่ก้อย)",
    Phone: "0834567890",
    PasswordHash: "staff123",
    Email: "koi@sabaidee.com",
    Address: "15 ลาดพร้าว ซอย 18 เขตจตุจักร กรุงเทพฯ",
    Province: "กรุงเทพมหานคร",
    District: "เขตจตุจักร",
    SubDistrict: "จอมพล",
    Latitude: 13.803455,
    Longitude: 100.569421,
    ProfileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60",
    Role: "Staff",
    Status: "Active",
    CreatedDate: "2026-04-10T10:15:00Z"
  },
  {
    UserID: "U004",
    Name: "อัญชลี รักษ์ดี (พี่นุ่ม)",
    Phone: "0845678901",
    PasswordHash: "staff123",
    Email: "num@sabaidee.com",
    Address: "45/7 ถนนรัชดาภิเษก เขตห้วยขวาง กรุงเทพฯ",
    Province: "กรุงเทพมหานคร",
    District: "เขตห้วยขวาง",
    SubDistrict: "ห้วยขวาง",
    Latitude: 13.776123,
    Longitude: 100.575892,
    ProfileImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=60",
    Role: "Staff",
    Status: "Active",
    CreatedDate: "2026-05-01T14:20:00Z"
  },
  // Customer User
  {
    UserID: "U005",
    Name: "อภิสิทธิ์ วรศิลป์",
    Phone: "0898765432",
    PasswordHash: "customer123",
    Email: "apisit@gmail.com",
    Address: "คอนโดศุภาลัย ปาร์ค เอกมัย-ทองหล่อ ถ.เพชรบุรีตัดใหม่ แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ",
    Province: "กรุงเทพมหานคร",
    District: "เขตห้วยขวาง",
    SubDistrict: "บางกะปิ",
    Latitude: 13.743122,
    Longitude: 100.588421,
    ProfileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60",
    Role: "Customer",
    Status: "Active",
    CreatedDate: "2026-05-20T11:00:00Z"
  }
];

const defaultStaff: Staff[] = [
  {
    StaffID: "SFT001",
    UserID: "U002",
    Nickname: "เจ้นง",
    Gender: "Female",
    Age: 38,
    Experience: 8,
    Description: "ถนัดนวดไทยกดจุด แก้อาการออฟฟิศซินโดรม นวดรีดเส้น และนวดประคบสมุนไพร ใจดี พูดจาไพเราะ ยินดีให้บริการค่ะ",
    Rating: 4.9,
    ReviewCount: 24,
    Credit: 450,
    Available: "ON",
    VerifyStatus: "Approved",
    CurrentLatitude: 13.779743,
    CurrentLongitude: 100.544773,
    LastLocationUpdate: "2026-06-27T18:50:00Z",
    TotalIncome: 14500,
    TotalJobs: 38
  },
  {
    StaffID: "SFT002",
    UserID: "U003",
    Nickname: "ก้อย",
    Gender: "Female",
    Age: 29,
    Experience: 4,
    Description: "เชี่ยวชาญการนวดอโรมา นวดสปา ขัดผิว และนวดฝ่าเท้าสไตล์ผ่อนคลาย เหมาะสำหรับผู้ที่ต้องการความผ่อนคลายสูงสุดหลังเหน็ดเหนื่อยจากการทำงานค่ะ",
    Rating: 4.7,
    ReviewCount: 15,
    Credit: 300,
    Available: "ON",
    VerifyStatus: "Approved",
    CurrentLatitude: 13.803455,
    CurrentLongitude: 100.569421,
    LastLocationUpdate: "2026-06-27T18:52:00Z",
    TotalIncome: 8200,
    TotalJobs: 18
  },
  {
    StaffID: "SFT003",
    UserID: "U004",
    Nickname: "นุ่ม",
    Gender: "Female",
    Age: 42,
    Experience: 12,
    Description: "ผ่านการอบรมจากศูนย์ฝึกนวดแผนไทยวัดโพธิ์ นวดแผนโบราณ นวดแก้อาการหลัง สะบักจม นวดแก้ไมเกรน ฝีมือการนวดหนักเบาสามารถแจ้งได้เลยค่ะ",
    Rating: 4.8,
    ReviewCount: 31,
    Credit: 80, // Low credit for demo (below default minCredit requirement)
    Available: "ON",
    VerifyStatus: "Approved",
    CurrentLatitude: 13.776123,
    CurrentLongitude: 100.575892,
    LastLocationUpdate: "2026-06-27T18:45:00Z",
    TotalIncome: 21000,
    TotalJobs: 54
  }
];

const defaultBookings: Booking[] = [
  {
    BookingID: "B001",
    CustomerID: "U005",
    StaffID: "SFT001",
    BookingDate: "2026-06-26",
    BookingTime: "14:00",
    ServiceID: "S001",
    ServicePrice: 350,
    Distance: 5.4,
    TravelFee: 81,
    TotalPrice: 431,
    CustomerLatitude: 13.743122,
    CustomerLongitude: 100.588421,
    CustomerAddress: "คอนโดศุภาลัย ปาร์ค เอกมัย-ทองหล่อ ถ.เพชรบุรีตัดใหม่ แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ",
    Status: "Completed",
    PaymentStatus: "Paid",
    CreatedDate: "2026-06-26T13:10:00Z"
  }
];

const defaultTransactions: CreditTransaction[] = [
  {
    TransactionID: "TX001",
    StaffID: "SFT001",
    Amount: 500,
    BeforeCredit: 0,
    AfterCredit: 500,
    Type: "Topup",
    SlipImage: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=150&auto=format&fit=crop&q=60",
    Status: "Approved",
    AdminRemark: "ยอดโอนผ่านพร้อมเพย์ ได้รับการตรวจสอบและอนุมัติแล้ว",
    CreatedDate: "2026-06-15T10:00:00Z"
  },
  {
    TransactionID: "TX002",
    StaffID: "SFT001",
    Amount: 50,
    BeforeCredit: 500,
    AfterCredit: 450,
    Type: "Deduct",
    SlipImage: "",
    Status: "Approved",
    AdminRemark: "หักค่าบริการคอมมิชชัน Booking #B001",
    CreatedDate: "2026-06-26T15:30:00Z"
  }
];

const defaultReviews: Review[] = [
  {
    ReviewID: "R001",
    BookingID: "B001",
    CustomerID: "U005",
    StaffID: "SFT001",
    Score: 5,
    Comment: "นวดดีมากค่ะ เจ้นงนวดน้ำหนักพอดี แก้อาการบ่าไหล่ตึงได้ตรงจุดมาก คุ้มค่าเงินจริงๆ",
    CreatedDate: "2026-06-26T16:00:00Z"
  }
];

const defaultNotifications: Notification[] = [
  {
    NotificationID: "N001",
    UserID: "U002",
    Title: "ยินดีต้อนรับสู่ SabaiDee Massage!",
    Detail: "บัญชีผู้ให้บริการของคุณได้รับการเปิดใช้งานแล้ว กรุณาเติมเครดิตเพื่อเริ่มรับงานบริการนวดจากลูกค้า",
    ReadStatus: "Unread",
    CreatedDate: "2026-06-15T09:30:00Z"
  },
  {
    NotificationID: "N002",
    UserID: "U005",
    Title: "บริการนวดของคุณเสร็จสิ้นแล้ว",
    Detail: "การจอง #B001 ได้รับการบริการเสร็จสิ้นแล้ว คุณสามารถเขียนรีวิวเพื่อให้คะแนนความพึงพอใจแก่พี่นงได้",
    ReadStatus: "Read",
    CreatedDate: "2026-06-26T15:30:00Z"
  }
];

export function getDatabase(): DatabaseSchema {
  if (!fs.existsSync(DB_PATH)) {
    const initialDB: DatabaseSchema = {
      users: defaultUsers,
      staff: defaultStaff,
      services: defaultServices,
      bookings: defaultBookings,
      transactions: defaultTransactions,
      reviews: defaultReviews,
      notifications: defaultNotifications,
      settings: defaultSettings
    };
    saveDatabase(initialDB);
    return initialDB;
  }
  
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to parse database, restoring defaults...", error);
    const initialDB: DatabaseSchema = {
      users: defaultUsers,
      staff: defaultStaff,
      services: defaultServices,
      bookings: defaultBookings,
      transactions: defaultTransactions,
      reviews: defaultReviews,
      notifications: defaultNotifications,
      settings: defaultSettings
    };
    saveDatabase(initialDB);
    return initialDB;
  }
}

export function saveDatabase(db: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  } catch (error) {
    console.error("Failed to save database", error);
  }
}
