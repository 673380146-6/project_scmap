import * as authService from '../services/auth.service.js';
import { success } from '../utils/response.js';

//Login <==========================================================>
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
       //ตรวจสอบ input
    if (!email || !password) {
      // กรอกข้อมูลไม่ครบ
      const error = new Error("ต้องกรอก Email หรือ Password");
      error.statusCode = 400;
      throw error;
    }

    const token = await authService.login(email, password);
      if (!token) {
      //login อีเมล/รหัสผิด
      const error = new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      error.statusCode = 401;
      throw error
    }

    return success(res, { token }, "Login successful");
  } catch (err) {
    // errorระบบภายในมีปัญหา
    next(err);
  } 
};
//Register <====================================================>
export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
      //ตรวจสอบ input
    if (!email || !password) {
      // กรอกข้อมูลไม่ครบ
      const error = new Error("ต้องกรอก Email หรือ Password");
      error.statusCode = 400;
      throw error;
    }

    const user = await authService.register(email, password);
    
    if (!user) {
      const error = new Error("อีเมลนี้ถูกใช้งานแล้ว");
      error.statusCode = 409;
      throw error;
    }

    return success(res, user, "User registered");
  } catch (err) {
    // errorระบบภายในมีปัญหา
    next(err);
  }
};
