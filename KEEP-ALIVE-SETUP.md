# Google Apps Script Keep-Alive Setup Guide

## วิธีติดตั้งและใช้งาน Google Apps Script เพื่อป้องกันเซิร์ฟเวอร์หลับ

### 📋 ขั้นตอนการติดตั้ง:

#### 1. สร้าง Google Apps Script Project
1. เปิด [script.google.com](https://script.google.com)
2. คลิก **"+ New project"**
3. ตั้งชื่อโปรเจ็กต์: `YouTube Downloader Keep-Alive`

#### 2. คัดลอกโค้ด
1. ลบโค้ดเก่าใน Code.gs
2. คัดลอกโค้ดทั้งหมดจากไฟล์ `keep-alive-script.gs`
3. วางในไฟล์ Code.gs
4. กด **Ctrl+S** เพื่อบันทึก

#### 3. ตั้งค่า Triggers
1. ใน Apps Script Editor
2. เลือกฟังก์ชัน `setupTriggers` จาก dropdown
3. กดปุ่ม **"Run"** (▶️)
4. อนุญาต permissions เมื่อระบบขอ:
   - Review permissions
   - Choose your Google account
   - Click "Allow"

#### 4. ตรวจสอบการทำงาน
1. เลือกฟังก์ชัน `getTriggerStatus`
2. กดปุ่ม **"Run"**
3. ดูผลลัพธ์ใน **"Execution transcript"**

### ⚙️ ฟีเจอร์หลัก:

#### 🔄 Auto Ping
- ปิง URL ทุก 15 นาที (ข้อจำกัดของ Google Apps Script: 1, 5, 10, 15, 30 นาทีเท่านั้น)
- ตรวจสอบ HTTP status code
- วัดเวลาตอบสนอง (response time)
- ระบบ retry อัตโนมัติเมื่อเกิดข้อผิดพลาด

**หมายเหตุ**: เซิร์ฟเวอร์อาจหลับช่วงสั้นๆ แต่จะตื่นเร็วเมื่อมีการปิง

#### 📊 Monitoring & Logging
- บันทึกผลการปิงใน Google Sheets
- แสดงเวลา, สถานะ, HTTP code, response time
- เก็บประวัติล่าสุด 1000 รายการ

#### 🛠️ Management Functions
```javascript
setupTriggers()      // ติดตั้ง auto trigger (รันครั้งเดียว)
testPing()          // ทดสอบการปิงด้วยตนเอง
getTriggerStatus()  // ตรวจสอบสถานะ trigger
deleteTriggers()    // ลบ triggers ทั้งหมด
emergencyStop()     // หยุดระบบฉุกเฉิน
```

### 📈 การใช้งาน Google Sheets Monitor:

#### สร้าง Monitoring Dashboard:
1. เปิด [sheets.google.com](https://sheets.google.com)
2. สร้าง spreadsheet ใหม่ชื่อ: `YouTube Downloader Keep-Alive Monitor`
3. ระบบจะสร้างแท็บ "Keep-Alive-Log" อัตโนมัติ

#### คอลัมน์ข้อมูล:
- **Timestamp**: เวลาที่ปิง
- **Status**: SUCCESS/WARNING/ERROR/RETRY_SUCCESS
- **HTTP Code**: รหัสตอบกลับ HTTP
- **Response Time**: เวลาตอบสนอง (มิลลิวินาที)
- **Message**: ข้อความเพิ่มเติม

### 🔧 การตั้งค่าเพิ่มเติม:

#### แก้ไขความถี่การปิง:
```javascript
// Google Apps Script รองรับเฉพาะ: 1, 5, 10, 15, 30 นาที
const PING_INTERVAL_MINUTES = 15; // เปลี่ยนเป็น 10 หรือ 30 ตามต้องการ
```

**ตัวเลือกความถี่**:
- **10 นาที**: เซิร์ฟเวอร์ไม่หลับเลย (ใช้ quota มาก)
- **15 นาที**: เซิร์ฟเวอร์อาจหลับช่วงสั้น (แนะนำ)
- **30 นาที**: เซิร์ฟเวอร์หลับบ่อย แต่ประหยัด quota

#### แก้ไข URL:
```javascript
const SERVER_URL = 'https://your-server-url.com'; // เปลี่ยน URL
```

#### แก้ไขจำนวนครั้งที่ retry:
```javascript
const MAX_RETRIES = 3; // เปลี่ยนเป็น 2, 5, 10
```

### 🚨 Troubleshooting:

#### ปัญหา: Permission denied
**แก้ไข**: 
1. ใน Apps Script Editor → ดู "Executions"
2. หาข้อผิดพลาด และ authorize permissions ใหม่

#### ปัญหา: Trigger ไม่ทำงาน
**แก้ไข**:
1. รัน `getTriggerStatus()` เพื่อตรวจสอบ
2. ถ้าไม่มี trigger รัน `setupTriggers()` ใหม่

#### ปัญหา: เซิร์ฟเวอร์ยังหลับ
**แก้ไข**:
1. ลดเวลา interval เป็น 10 นาที
2. เพิ่ม endpoint อื่นๆ ใน `advancedPing()`

### 📱 การแจ้งเตือน (ทำได้เพิ่ม):

#### Email Alert เมื่อเซิร์ฟเวอร์ลงได้เพิ่ม:
```javascript
function sendAlert(message) {
  GmailApp.sendEmail(
    'your-email@gmail.com',
    'Server Alert',
    message
  );
}
```

### 🔒 ความปลอดภัย:

- ใช้ Google's infrastructure ที่มีความปลอดภัยสูง
- ไม่เก็บข้อมูลส่วนตัวใดๆ
- ปิงเฉพาะ URL ที่ระบุ
- ใช้ HTTPS เท่านั้น

### ✅ การทดสอบ:

1. **ทดสอบการปิง**: รัน `testPing()`
2. **ตรวจสอบ log**: ดูใน Google Sheets
3. **ทดสอบ trigger**: รอ 14 นาทีและตรวจสอบ log ใหม่

### 💡 Tips:

1. **ตั้งเวลาให้เหมาะสม**: Render.com หลับหลัง 15 นาทีไม่มีการใช้งาน
2. **ใช้ multiple endpoints**: ปิงหลาย URL เพื่อความแน่ใจ
3. **Monitor ผล**: ตรวจสอบ Google Sheets เป็นประจำ
4. **Backup script**: สำรองโค้ด Apps Script ไว้

---

## 🎯 สรุป:
Google Apps Script นี้จะช่วยให้เซิร์ฟเวอร์ YouTube Downloader บน Render.com ทำงานต่อเนื่อง 24/7 โดยปิงทุก 14 นาที เพื่อป้องกันการหลับ และมีระบบ monitoring ผ่าน Google Sheets
