# 🚀 Quick Start Guide - Firebase Registration & Login

## ขั้นตอนการเริ่มต้น

### 1️⃣ Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

---

### 2️⃣ Setup Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/`:

```bash
PORT=3000
NODE_ENV=development
JWT_SECRET=your_secret_key_here_change_in_production
FIREBASE_PROJECT_ID=sci-map-eb9f8
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_email@iam.gserviceaccount.com
FRONTEND_URL=http://localhost:5173
```

---

### 3️⃣ Run the Application

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
✅ Server จะรันที่ `http://localhost:3000`

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
✅ Frontend จะรันที่ `http://localhost:5173`

---

## 🧪 Testing the Flow

### Step 1: สมัครสมาชิก
1. เปิด browser ไปที่ `http://localhost:5173`
2. คลิก "ลงชื่อสมัคร" (Register)
3. กรอกข้อมูล:
   - **ชื่อ**: นักเรียน ทดสอบ
   - **คณะ**: วิทยาศาสตร์
   - **สาขา**: วิทยาการคอมพิวเตอร์
   - **ชั้นปี**: ปี 3
   - **รหัสนักศึกษา**: 6430000001
   - **รหัสผ่าน**: password123
   - **สิ่งของที่ชอบ**: หนังสือ

4. คลิก "สมัครสมาชิก"
5. หากสำเร็จ จะเห็น "สมัครเรียบร้อยแล้ว!" และจะเปลี่ยนไปหน้า login

### Step 2: เข้าสู่ระบบ
1. ยังคงอยู่ในหน้า login
2. กรอกข้อมูล:
   - **รหัสนักศึกษา**: 6430000001
   - **รหัสผ่าน**: password123
3. คลิก "ดำเนินการต่อ"
4. หากสำเร็จ จะเปลี่ยนไปหน้า map

---

## 🔍 Verify Data in Firebase Firestore

1. ไปที่ [Firebase Console](https://console.firebase.google.com)
2. เลือก project `sci-map`
3. ไปที่ **Firestore Database**
4. มองหา collection `users`
5. คุณควรเห็น document ของ user ที่สมัครแล้ว

ตัวอย่างข้อมูล:
```json
{
  "name": "นักเรียน ทดสอบ",
  "email": "6430000001@student.mail",
  "password": "hashed_password_bcrypt",
  "faculty": "วิทยาศาสตร์",
  "major": "วิทยาการคอมพิวเตอร์",
  "year": "3",
  "studentId": "6430000001",
  "favoriteThing": "หนังสือ",
  "role": "user",
  "isActive": true,
  "isVerified": false,
  "createdAt": "2024-10-30T10:00:00.000Z",
  "updatedAt": "2024-10-30T10:00:00.000Z"
}
```

---

## 🧬 API Testing with cURL

### Test Register
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "6430000001@student.mail",
    "password": "password123",
    "faculty": "วิทยาศาสตร์",
    "major": "วิทยาการคอมพิวเตอร์",
    "year": "3",
    "studentId": "6430000001",
    "favoriteThing": "หนังสือ"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "สมัครสมาชิกสำเร็จ",
  "user": {
    "id": "auto_generated_id",
    "name": "Test User",
    "email": "6430000001@student.mail",
    "role": "user"
  }
}
```

---

### Test Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "6430000001@student.mail",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "เข้าสู่ระบบสำเร็จ",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "auto_generated_id",
    "name": "Test User",
    "email": "6430000001@student.mail",
    "role": "user"
  }
}
```

---

### Test Get Users (Protected)
```bash
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 already in use | `lsof -i :3000` จากนั้น `kill -9 <PID>` |
| Firebase connection error | ตรวจสอบ `serviceAccountKey.json` และ credentials |
| CORS error | ตรวจสอบว่า backend มี CORS enabled |
| "Email already exists" | ใช้ email ที่ต่างออกไป |
| "Invalid token" | ตรวจสอบ JWT_SECRET ในไฟล์ `.env` |

---

## 📝 File Structure

```
project_scmap/
├── backend/
│   ├── src/
│   │   ├── app.js                 ✅ Main app config
│   │   ├── server.js              ✅ Server entry
│   │   ├── controllers/
│   │   │   ├── auth.controller.js ✅ Register, Login
│   │   │   └── user.controller.js ✅ User operations
│   │   ├── routes_API/
│   │   │   ├── auth.routes.js     ✅ Auth endpoints
│   │   │   └── users.routes.js    ✅ User endpoints
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js ✅ JWT verification
│   │   │   └── error.middleware.js ✅ Error handling
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── user.service.js
│   │   │   └── firestore.service.js ✅ Database operations
│   │   └── config/
│   │       └── firebase-admin.js  ✅ Firebase init
│   ├── package.json               ✅ Updated dependencies
│   └── .env.example               ✅ Environment template
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── register.vue       ✅ Register page
        │   └── login.vue          ✅ Login page
        └── services/
            └── api.js             ✅ API calls
```

---

## 🔐 Security Features Implemented

✅ Password hashing (bcrypt)  
✅ JWT Token authentication  
✅ CORS protection  
✅ Helmet.js security headers  
✅ Brute force protection (3 attempts → 1 min lockout)  
✅ Input validation  
✅ Password removal from API responses  

---

## 📚 Database Schema

### Users Collection

```
users/
├── document_id_1
│   ├── name: string
│   ├── email: string
│   ├── password: string (hashed)
│   ├── faculty: string
│   ├── major: string
│   ├── year: string
│   ├── studentId: string
│   ├── favoriteThing: string
│   ├── role: string (user|admin)
│   ├── isActive: boolean
│   ├── isVerified: boolean
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp
```

---

## 🚀 Next Steps

- [ ] Add email verification
- [ ] Implement password reset
- [ ] Add rate limiting
- [ ] Setup production environment
- [ ] Add user profile page
- [ ] Implement refresh token
- [ ] Add two-factor authentication
- [ ] Setup HTTPS/SSL

---

**Created**: October 30, 2025  
**Status**: ✅ Ready for testing
