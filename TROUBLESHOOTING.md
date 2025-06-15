# 🔧 การแก้ไขปัญหา YouTube Downloader

## ปัญหาที่พบบ่อยและวิธีแก้ไข

### 1. 🚫 API Error 500 - "Failed to get video information"

**สาเหตุ:**
- ปัญหากับ ytdl-core package เนื่องจาก YouTube เปลี่ยน API
- วิดีโอถูกจำกัดการเข้าถึงหรือเป็น private
- Network timeout

**วิธีแก้:**
1. ✅ อัปเดตเป็น `@distube/ytdl-core` แล้ว
2. ตรวจสอบ URL ว่าเป็น public video
3. ลองใช้ URL ที่สั้นกว่า (youtu.be format)

### 2. 🚫 Favicon 404 Error

**สาเหตุ:** เบราว์เซอร์ขอไฟล์ favicon.ico โดยอัตโนมัติ

**วิธีแก้:** ✅ เพิ่ม endpoint ใน server.js แล้ว

### 3. 🚫 CORS Error

**สาเหตุ:** ปัญหา Cross-Origin Resource Sharing

**วิธีแก้:** ✅ เพิ่ม CORS middleware แล้ว

### 4. 🚫 Port 3000 ถูกใช้งาน (EADDRINUSE)

**วิธีแก้:**
```powershell
# หาและจบ process ที่ใช้ port 3000
Get-Process -Name "node" | Stop-Process -Force
# หรือ
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F
```

### 5. 🚫 Dependencies Error

**วิธีแก้:**
```powershell
# ลบ node_modules และติดตั้งใหม่
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## 🧪 การทดสอบ API

### Manual Testing
1. เปิด http://localhost:3000/test.html
2. ทดสอบแต่ละ endpoint
3. ดู console logs ใน terminal

### Command Line Testing
```powershell
# Health Check
Invoke-RestMethod -Uri "http://localhost:3000/health"

# Video Info (แทนที่ URL)
$body = @{url = "https://www.youtube.com/watch?v=VIDEO_ID"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/video-info" -Method POST -Body $body -ContentType "application/json"
```

## 📊 การตรวจสอบสถานะ

### เช็คเซิร์ฟเวอร์
```powershell
# ดูว่า Node.js process ทำงานอยู่หรือไม่
Get-Process -Name "node" -ErrorAction SilentlyContinue

# ตรวจสอบ port 3000
netstat -an | findstr 3000
```

### ดู Logs
- ดู terminal ที่รัน server.js
- เปิด Developer Tools ในเบราว์เซอร์ (F12)
- ดู Network tab สำหรับ API calls

## ⚡ Performance Tips

### 1. ใช้ Dev Mode
```powershell
npm run dev  # ใช้ nodemon สำหรับ auto-restart
```

### 2. เปิด Verbose Logging
เพิ่มใน server.js:
```javascript
console.log('Debug info:', ...);
```

### 3. Rate Limiting
- ปัจจุบันจำกัด 10 requests ต่อนาที
- สามารถปรับแต่งในตัวแปร `RATE_LIMIT_MAX_REQUESTS`

## 🔄 การอัปเดต

### อัปเดต Dependencies
```powershell
npm update
npm audit fix
```

### อัปเดต ytdl-core
```powershell
npm uninstall @distube/ytdl-core
npm install @distube/ytdl-core@latest
```

## 🆘 หากยังแก้ไม่ได้

1. **ตรวจสอบ Node.js version:**
   ```powershell
   node --version  # ควรเป็น v16 ขึ้นไป
   ```

2. **ลบและติดตั้งใหม่:**
   ```powershell
   Remove-Item -Recurse -Force node_modules, package-lock.json
   npm install
   ```

3. **ใช้ Docker:**
   ```powershell
   docker build -t youtube-downloader .
   docker run -p 3000:3000 youtube-downloader
   ```

4. **ตรวจสอบ Firewall/Antivirus:**
   - Windows Defender อาจบล็อก Node.js
   - เพิ่ม exception สำหรับ port 3000

## 📞 Getting Help

หากยังมีปัญหา:
1. ดู logs ใน terminal
2. ทดสอบด้วย /test.html
3. ตรวจสอบ Network tab ใน browser
4. แชร์ error message เพื่อขอความช่วยเหลือ
