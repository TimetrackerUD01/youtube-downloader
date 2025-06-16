# ❌ แก้ไขข้อผิดพลาด Google Apps Script Trigger

## 🚨 ปัญหาที่พบ:
```
Exception: The value you passed to everyMinutes was invalid. 
It must be one of 1, 5, 10, 15 or 30.
setupTriggers @ keep-alive-script.gs:179
```

## ✅ สาเหตุและการแก้ไข:

### สาเหตุ:
- Google Apps Script รองรับเฉพาะ **1, 5, 10, 15, 30 นาที** เท่านั้น
- เราตั้งค่าเป็น **14 นาที** ซึ่งไม่ได้รับการสนับสนุน

### การแก้ไข:
เปลี่ยนจาก **14 นาที** เป็น **15 นาที**

```javascript
// เดิม (ผิด)
const PING_INTERVAL_MINUTES = 14;

// ใหม่ (ถูก)
const PING_INTERVAL_MINUTES = 15;
```

## 🎯 ไฟล์ที่อัปเดตแล้ว:

### 1. ✅ keep-alive-script.gs
- เปลี่ยนเป็น 15 นาที
- เพิ่มคำอธิบายข้อจำกัด

### 2. ✅ keep-alive-simple.gs  
- เปลี่ยนเป็น 15 นาที
- เพิ่มหมายเหตุ

### 3. 🆕 keep-alive-alternative.gs
- **ตัวเลือก 1**: 10 นาที (เซิร์ฟเวอร์ไม่หลับเลย)
- **ตัวเลือก 2**: 15 นาที (ประหยัด quota)

### 4. ✅ KEEP-ALIVE-SETUP.md
- อัปเดตคำแนะนำ
- เพิ่มข้อมูลข้อจำกัด

## 📊 เปรียบเทียบตัวเลือก:

| ความถี่ | ข้อดี | ข้อเสีย | แนะนำสำหรับ |
|---------|-------|---------|-------------|
| **10 นาที** | ไม่หลับเลย | ใช้ quota มาก | Production สำคัญ |
| **15 นาที** | สมดุล | หลับช่วงสั้น | ใช้งานทั่วไป |
| **30 นาที** | ประหยัด quota | หลับบ่อย | ทดสอบ/พัฒนา |

## 🔧 วิธีใช้งานหลังแก้ไข:

### ขั้นตอนที่ 1: เลือกไฟล์
- **ง่าย**: `keep-alive-simple.gs` (15 นาที)
- **ครบฟีเจอร์**: `keep-alive-script.gs` (15 นาที + logging)
- **ยืดหยุ่น**: `keep-alive-alternative.gs` (10 หรือ 15 นาที)

### ขั้นตอนที่ 2: ติดตั้งใหม่
1. ลบ trigger เก่า: `deleteTriggers()`
2. ติดตั้งใหม่: `setupTriggers()`
3. ตรวจสอบ: `getTriggerStatus()`

### ขั้นตอนที่ 3: ยืนยันการทำงาน
- ดู log ใน Google Apps Script
- รอ 15-20 นาที แล้วตรวจสอบ server
- หาก server ตอบสนอง = สำเร็จ ✅

## 💡 เคล็ดลับเพิ่มเติม:

### หากต้องการ uptime สูงสุด:
```javascript
// ใช้ keep-alive-alternative.gs
setupTriggers(); // 10 นาที (ไม่หลับเลย)
```

### หากต้องการประหยัด quota:
```javascript
// ใช้ keep-alive-alternative.gs  
setupLowFrequency(); // 15 นาที (สมดุล)
```

## 🎉 ผลลัพธ์:
- ✅ ไม่มี error จาก trigger อีกต่อไป
- ✅ เซิร์ฟเวอร์ทำงานต่อเนื่อง (อาจหลับช่วงสั้น)
- ✅ ระบบ keep-alive ทำงานได้ 24/7

## 📞 หากยังมีปัญหา:
1. ตรวจสอบ trigger: `getTriggerStatus()`
2. ดู execution log ใน Google Apps Script
3. ทดสอบ manual ping: `testPing()`
4. ใช้ไฟล์ alternative สำหรับตัวเลือกเพิ่มเติม
