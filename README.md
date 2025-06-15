# YouTube Downloader

เว็บแอพพลิเคชันสำหรับดาวน์โหลดวิดีโอและเสียงจาก YouTube ฟรี

## ฟีเจอร์

- 🎥 **ดาวน์โหลดวิดีโอ MP4** - รองรับหลายความละเอียด (360p, 480p, 720p, 1080p)
- 🎵 **แยกเสียง MP3** - คุณภาพสูงถึง 320kbps
- 🔍 **ค้นหาวิดีโอ** - ค้นหาวิดีโอโดยตรงจากเว็บไซต์
- 📱 **รองรับมือถือ** - ใช้งานได้ทุกอุปกรณ์
- ⚡ **เร็วและปลอดภัย** - ไม่เก็บข้อมูลส่วนบุคคล

## การติดตั้งและใช้งาน

### สิ่งที่ต้องมี

- Node.js (เวอร์ชัน 16 หรือใหม่กว่า)
- npm หรือ yarn

### การติดตั้ง

1. Clone repository หรือดาวน์โหลดไฟล์
```bash
git clone <repository-url>
cd youtube-downloader
```

2. ติดตั้ง dependencies
```bash
npm install
```

3. เริ่มเซิร์ฟเวอร์
```bash
npm start
```

4. เปิดเบราว์เซอร์และไปที่ `http://localhost:3000`

### สำหรับ Windows (PowerShell)

```powershell
cd "path\to\youtube-downloader"
npm install
npm start
```

## การใช้งาน

### 1. ดาวน์โหลดจาก URL
1. วาง URL ของวิดีโอ YouTube ในช่องแรก
2. คลิก "ดึงข้อมูลวิดีโอ"
3. เลือกรูปแบบที่ต้องการ (MP4 หรือ MP3)
4. คลิกเพื่อดาวน์โหลด

### 2. ค้นหาและดาวน์โหลด
1. ไปที่แท็บ "ค้นหา"
2. ใส่คำค้นหา
3. เลือกวิดีโอจากผลลัพธ์
4. เลือกรูปแบบและดาวน์โหลด

## ข้อควรระวัง

⚠️ **หมายเหตุสำคัญ:**
- ใช้เฉพาะกับเนื้อหาที่คุณมีสิทธิ์ดาวน์โหลด
- ปฏิบัติตามข้อกำหนดการใช้งานของ YouTube
- ไม่ควรใช้เพื่อการค้าหรือการละเมิดลิขสิทธิ์

## YouTube Downloader API

🎥 API สำหรับดาวน์โหลดวิดีโอและเสียงจาก YouTube

## ฟีเจอร์

- ✅ ดาวน์โหลดวิดีโอ MP4 หลายความละเอียด
- ✅ แยกเสียง MP3 คุณภาพสูง  
- ✅ ค้นหาวิดีโอใน YouTube
- ✅ Rate limiting
- ✅ Error handling
- ✅ CORS support
- ✅ Dockerized
- ✅ พร้อม deploy บน Render

## การติดตั้ง

### ติดตั้งแบบ Local

```bash
# Clone repository
git clone <repository-url>
cd youtube-downloader-api

# ติดตั้ง dependencies
npm install

# รันเซิร์ฟเวอร์
npm start

# หรือรันในโหมด development
npm run dev