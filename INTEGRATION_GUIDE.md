# 📋 ระบบการสมัครสมาชิก Firebase Integration Guide

## ✅ สิ่งที่ได้ทำแล้ว

### Backend (Node.js + Express + Firebase Firestore)

1. **Auth Controller** (`backend/src/controllers/auth.controller.js`)
   - ✅ `register` - สมัครสมาชิกใหม่ พร้อมเข้ารหัสรหัสผ่าน
   - ✅ `login` - เข้าสู่ระบบ พร้อมสร้าง JWT Token
   - ✅ `logout` - ออกจากระบบ
   - ✅ ป้องกัน Brute Force Attack (ล็อกบัญชีหลังจากพยายาม 3 ครั้ง)

2. **User Controller** (`backend/src/controllers/user.controller.js`)
   - ✅ `getUsers` - ดึงรายชื่อ user ทั้งหมด
   - ✅ `getUserById` - ดึงข้อมูล user ตาม ID
   - ✅ `createUser` - สร้าง user ใหม่
   - ✅ `updateUser` - อัปเดตข้อมูล user
   - ✅ `deleteUser` - ลบ user

3. **Routes**
   - ✅ `POST /api/v1/auth/register` - สมัครสมาชิก
   - ✅ `POST /api/v1/auth/login` - เข้าสู่ระบบ
   - ✅ `POST /api/v1/auth/logout` - ออกจากระบบ
   - ✅ `GET /api/v1/users` - ดึง user ทั้งหมด (ต้อง authenticate)
   - ✅ `GET /api/v1/users/:id` - ดึง user ตาม ID (ต้อง authenticate)
   - ✅ `POST /api/v1/users` - สร้าง user ใหม่
   - ✅ `PUT /api/v1/users/:id` - อัปเดต user (ต้อง authenticate)
   - ✅ `DELETE /api/v1/users/:id` - ลบ user (ต้อง authenticate)

4. **Middleware**
   - ✅ `authMiddleware` - ตรวจสอบ JWT Token
   - ✅ `errorMiddleware` - จัดการ Error ทั่วโลก

5. **Firebase Firestore Service**
   - ✅ `create` - สร้าง document
   - ✅ `getById` - ดึง document ตาม ID
   - ✅ `getAll` - ดึง documents ทั้งหมด
   - ✅ `update` - อัปเดต document
   - ✅ `delete` - ลบ document
   - ✅ `query` - ค้นหา documents

### Frontend (Vue 3 + Vite)

1. **API Service** (`frontend/src/services/api.js`)
   - ✅ `register` - เรียก endpoint register
   - ✅ `login` - เรียก endpoint login
   - ✅ `logout` - เรียก endpoint logout
   - ✅ `getUsers` - ดึง user ทั้งหมด
   - ✅ `getUserById` - ดึง user ตาม ID
   - ✅ `createUser` - สร้าง user
   - ✅ `updateUser` - อัปเดต user
   - ✅ `deleteUser` - ลบ user

2. **Register Page** (`frontend/src/pages/register.vue`)
   - ✅ รับข้อมูลจากฟอร์ม
   - ✅ ตรวจสอบเงื่อนไข (รหัสนักศึกษา 10 ตัว, รหัสผ่าน >= 6 ตัว)
   - ✅ ส่งข้อมูลไป backend
   - ✅ แสดงข้อความสำเร็จ/ข้อผิดพลาด
   - ✅ เปลี่ยนไปหน้า login หลังจากสมัครสำเร็จ

## 🚀 วิธีการใช้งาน

### 1. ติดตั้ง Dependencies

**Backend**
```bash
cd backend
npm install
```

**Frontend**
```bash
cd frontend
npm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ backend (ดูตัวอย่างใน `.env.example`)

```bash
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_change_this_in_production
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FRONTEND_URL=http://localhost:5173
```

### 3. เรียกใช้ Backend

```bash
cd backend
npm run dev
```

Server จะรันที่ `http://localhost:3000`

### 4. เรียกใช้ Frontend

```bash
cd frontend
npm run dev
```

Frontend จะรันที่ `http://localhost:5173`

## 📊 Firestore Collection Schema

### Users Collection
```javascript
{
  id: "auto_generated",
  name: "John Doe",
  email: "6430000001@student.mail",
  password: "hashed_password",
  faculty: "วิทยาศาสตร์",
  major: "วิทยาการคอมพิวเตอร์",
  year: "3",
  studentId: "6430000001",
  favoriteThing: "หนังสือ",
  role: "user",
  isActive: true,
  isVerified: false,
  createdAt: "2024-10-30T10:00:00Z",
  updatedAt: "2024-10-30T10:00:00Z"
}
```

## 🔐 ความปลอดภัย

✅ **สิ่งที่ได้ทำการป้องกัน:**
1. เข้ารหัสรหัสผ่านด้วย bcrypt (salt rounds: 10)
2. JWT Token สำหรับ authentication
3. Helmet.js สำหรับ HTTP headers protection
4. CORS configuration
5. Brute Force Attack prevention (ล็อกบัญชี 1 นาที)
6. ลบรหัสผ่านออกจากผลลัพธ์ API

⚠️ **ต้องทำเพิ่มเติม:**
- [ ] HTTPS SSL/TLS in production
- [ ] Token refresh mechanism
- [ ] Rate limiting per IP
- [ ] Input validation & sanitization
- [ ] Email verification
- [ ] Password reset functionality

## 📝 API Examples

### 1. สมัครสมาชิก
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "นักเรียน",
    "email": "6430000001@student.mail",
    "password": "password123",
    "faculty": "วิทยาศาสตร์",
    "major": "วิทยาการคอมพิวเตอร์",
    "year": "3",
    "studentId": "6430000001",
    "favoriteThing": "หนังสือ"
  }'
```

### 2. เข้าสู่ระบบ
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "6430000001@student.mail",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "เข้าสู่ระบบสำเร็จ",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "doc_id",
    "name": "นักเรียน",
    "email": "6430000001@student.mail",
    "role": "user"
  }
}
```

### 3. ดึงข้อมูล User (ต้อง authenticate)
```bash
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 🧪 Testing

คุณสามารถใช้ Postman หรือ curl เพื่อทดสอบ API endpoints

### Import to Postman
สร้าง collection ใหม่ และเพิ่ม endpoints ดังนี้:

1. **Register** (POST): `{{base_url}}/auth/register`
2. **Login** (POST): `{{base_url}}/auth/login`
3. **Get Users** (GET): `{{base_url}}/users` (ต้อง Bearer token)
4. **Get User By ID** (GET): `{{base_url}}/users/:id` (ต้อง Bearer token)
5. **Create User** (POST): `{{base_url}}/users`
6. **Update User** (PUT): `{{base_url}}/users/:id` (ต้อง Bearer token)
7. **Delete User** (DELETE): `{{base_url}}/users/:id` (ต้อง Bearer token)

## 🐛 Troubleshooting

### Problem: "Connection refused"
- ตรวจสอบว่า backend รันที่ port 3000

### Problem: "Firebase not initialized"
- ตรวจสอบ `serviceAccountKey.json` อยู่ที่ `backend/src/config/`
- ตรวจสอบ credentials ในไฟล์ Firebase config

### Problem: "Token error"
- ตรวจสอบ `JWT_SECRET` ใน `.env`
- ตรวจสอบ Authorization header format: `Bearer <token>`

## 📚 References

- [Express.js Documentation](https://expressjs.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [Vue 3](https://vuejs.org/)

---

**ทำโดย**: GitHub Copilot  
**วันที่**: October 30, 2025
