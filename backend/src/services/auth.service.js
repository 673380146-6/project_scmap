const loginAttempts = new Map();

// config
const MAX_ATTEMPTS = 3;
const LOCK_DURATION_MS = 1 * 60 * 1000; // 1 นาที

export const login = (email, password) => {
  const now = Data.now();

  // เช็คว่า user นี้เคยพลาด/ถูกล็อกมั้ย
  const attempt = loginAttempts.get(email);

  if (attempt && attempt.lockedUntil && now < attempt.lockedUntil) {
    // ยังถูกล็อกอยู่
    const remainingSec = Math.ceil((attempt.lockedUntil - now) / 1000);
    const err = new Error(`บัญชีถูกล็อก โปรดลองใหม่อีกครั้งใน ${remainingSec} วินาที`);
    err.statusCode = 423; // Locked
    throw err;
  }

  if (email === 'test@example.com' && password === '1234') {
    // ล็อกอินสำเร็จ → reset attempts
    loginAttempts.delete(email);
    return "mock-jwt-token";
  }
  // ถ้า credential ไม่ถูกต้อง → เพิ่มจำนวนครั้งที่ผิด
  let failedAttempts = 1;
  let lockedUntil = null;

  if (attempt) {
    failedAttempts = attempt.failedAttempts + 1;
    if (failedAttempts >= MAX_ATTEMPTS) {
      lockedUntil = now + LOCK_DURATION_MS; // ล็อกบัญชี
    }
  }

  loginAttempts.set(email, { failedAttempts, lockedUntil });
  
  const err = new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  err.statusCode = failedAttempts >= MAX_ATTEMPTS ? 423 : 401;
  throw err;
};

export const register = (email, password) => {
  return { id: 1, email, password: "***" };
};
