import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


const loginAttempts = new Map();
const blacklistedTokens = new Set();

// config
const MAX_ATTEMPTS = 3;
const LOCK_DURATION_MS = 1 * 60 * 1000; // 1 นาที


export const login = async (email, password) => {
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

  const user = users.find(u => u.email === email);
  if (!user) {
    recordFail(email, attempt, now);
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    recordFail(email, attempt, now);
  }
  
  loginAttempts.delete(email);

  // สร้าง JWT
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  return token;
};


 export const register = async (email, password) => {
  const exists = users.find(u => u.email === email);
  if (exists) return null;

  const hashed = await bcrypt.hash(password, 10);
  const newUser = { id: users.length + 1, email, password: hashed };
  users.push(newUser);

  return { id: newUser.id, email: newUser.email };
};

function recordFail(email, attempt, now) {
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

export const logout = (token) => {
  blacklistedTokens.add(token);
  return true;
};

export const isTokenBlacklisted = (token) => {
  return blacklistedTokens.has(token);
};  
