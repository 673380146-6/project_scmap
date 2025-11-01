import bcrypt from 'bcrypt';
import FirestoreService from '../services/firestore.service.js';
import jwt from 'jsonwebtoken';

// ตัวแปรจัดเก็บ login attempts
const loginAttempts = new Map();
const MAX_ATTEMPTS = 3;
const LOCK_DURATION_MS = 1 * 60 * 1000; // 1 นาที

/**
 * สมัครสมาชิก
 * POST /api/v1/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, faculty, major, year, studentId, favoriteThing, role = 'user' } = req.body;

    // ✅ ตรวจสอบฟิลด์ที่จำเป็น (ไม่ต้องมี email)
    if (!name || !password || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, รหัสผ่าน, รหัสนักศึกษา)'
      });
    }

    // ✅ ตรวจสอบรูปแบบรหัสนักศึกษา (XXXXXXXXX-X)
    const studentIdPattern = /^[0-9]{9}-[0-9]{1}$/;
    if (!studentIdPattern.test(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'รูปแบบรหัสนักศึกษาไม่ถูกต้อง (ต้องเป็น XXXXXXXXX-X)'
      });
    }

    // ✅ ตรวจสอบว่ารหัสผ่านมีความยาวเพียงพอ
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
      });
    }

    // ✅ ตรวจสอบว่า studentId นี้มีในระบบแล้วหรือไม่
    const existingUsers = await FirestoreService.query('users', [
      { field: 'studentId', operator: '==', value: studentId }
    ]);

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'รหัสนักศึกษานี้ถูกใช้งานแล้ว'
      });
    }

    // ✅ เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ บันทึกข้อมูลลงใน Firebase Firestore
    const userData = {
      name,
      password: hashedPassword,
      faculty,
      major,
      year,
      studentId,
      favoriteThing,
      role,
      isActive: true,
      isVerified: false // ยังไม่ได้ยืนยัน
    };

    // เพิ่ม email ถ้ามี
    if (email) {
      userData.email = email;
    }

    const newUser = await FirestoreService.create('users', userData);

    return res.status(201).json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email || null,
        role: newUser.role,
        studentId: newUser.studentId
      }
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก',
      error: error.message
    });
  }
};

/**
 * เข้าสู่ระบบ
 * POST /api/v1/auth/login
 */
export const login = async (req, res) => {
  try {
    const { studentId, password } = req.body;

    if (!studentId || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกรหัสนักศึกษาและรหัสผ่าน'
      });
    }

    // ✅ ตรวจสอบรูปแบบรหัสนักศึกษา
    const studentIdPattern = /^[0-9]{9}-[0-9]{1}$/;
    if (!studentIdPattern.test(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'รูปแบบรหัสนักศึกษาไม่ถูกต้อง (ต้องเป็น XXXXXXXXX-X)'
      });
    }

    const now = Date.now();

    // ✅ ตรวจสอบว่า user ถูกล็อกหรือไม่
    const attempt = loginAttempts.get(studentId);
    if (attempt && attempt.lockedUntil && now < attempt.lockedUntil) {
      const remainingSec = Math.ceil((attempt.lockedUntil - now) / 1000);
      return res.status(423).json({
        success: false,
        message: `บัญชีถูกล็อก โปรดลองใหม่อีกครั้งใน ${remainingSec} วินาที`
      });
    }

    // ✅ ค้นหา user ในฐานข้อมูล โดยใช้ studentId
    const users = await FirestoreService.query('users', [
      { field: 'studentId', operator: '==', value: studentId }
    ]);

    if (users.length === 0) {
      recordLoginFail(studentId);
      return res.status(401).json({
        success: false,
        message: 'รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    const user = users[0];

    // ✅ เปรียบเทียบรหัสผ่าน
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      recordLoginFail(studentId);
      return res.status(401).json({
        success: false,
        message: 'รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    // ✅ ล้าง login attempts
    loginAttempts.delete(studentId);

    // ✅ ตรวจสอบว่า user ยังไม่ถูกระงับการใช้งาน
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'บัญชีนี้ถูกปิดการใช้งาน'
      });
    }

    // ✅ สร้าง JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        studentId: user.studentId,
        role: user.role
      },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user.id,
        name: user.name,
        studentId: user.studentId,
        role: user.role,
        faculty: user.faculty,
        major: user.major,
        year: user.year
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
      error: error.message
    });
  }
};

/**
 * ออกจากระบบ
 * POST /api/v1/auth/logout
 */
export const logout = async (req, res) => {
  try {
    // ที่นี่คุณอาจต้องการเพิ่ม token ไปยัง blacklist หรือ invalidate session
    return res.status(200).json({
      success: true,
      message: 'ออกจากระบบสำเร็จ'
    });
  } catch (error) {
    console.error('Logout Error:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการออกจากระบบ'
    });
  }
};

/**
 * ฟังก์ชัน helper สำหรับบันทึกการเข้าสู่ระบบที่ล้มเหลว
 */
function recordLoginFail(studentId) {
  const now = Date.now();
  const attempt = loginAttempts.get(studentId);

  let failedAttempts = 1;
  let lockedUntil = null;

  if (attempt) {
    failedAttempts = attempt.failedAttempts + 1;
  }

  if (failedAttempts >= MAX_ATTEMPTS) {
    lockedUntil = now + LOCK_DURATION_MS;
  }

  loginAttempts.set(studentId, { failedAttempts, lockedUntil });
}
