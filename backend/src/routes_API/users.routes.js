import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// GET /users → ดึง user ทั้งหมด
router.get('/',authMiddleware, userController.getUsers);

// GET /users/:id → ดึง user ตาม id
router.get('/:id',authMiddleware, userController.getUserById);

// POST /users → สร้าง user ใหม่ (ใช้สำหรับ register ผ่าน API โดยตรง)
router.post('/', userController.createUser);

// PUT /users/:id → อัปเดต user
router.put('/:id',authMiddleware, userController.updateUser);

// DELETE /users/:id → ลบ user
router.delete('/:id',authMiddleware, userController.deleteUser);

export default router;
