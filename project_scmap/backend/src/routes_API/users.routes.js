import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';

const router = Router();

// GET /users → ดึง user ทั้งหมด
router.get('/', userController.getUsers);

// GET /users/:id → ดึง user ตาม id
router.get('/:id', userController.getUserById);

// POST /users → สร้าง user ใหม่
router.post('/', userController.createUser);

// PUT /users/:id → อัปเดต user
router.put('/:id', userController.updateUser);

// DELETE /users/:id → ลบ user
router.delete('/:id', userController.deleteUser);

export default router;
