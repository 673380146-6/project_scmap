import jwt from 'jsonwebtoken';

/**
 * Middleware ตรวจสอบ JWT Token
 */
export const authMiddleware = (req, res, next) => {
  try {
    // ดึง token จาก header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'ไม่พบ token'
      });
    }

    // ตรวจสอบและ decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token ไม่ถูกต้องหรือหมดอายุ',
      error: error.message
    });
  }
};
