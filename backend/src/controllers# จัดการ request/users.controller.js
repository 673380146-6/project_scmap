import * as userService from '../services/user.service.js';
import { success } from '../utils/response.js';

export const getUsers = (req, res, next) => {
  try {
    const users = userService.getUsers();
    return success(res, users);
  } catch (err) {
    next(err);
  }
};

// ดึง user ตาม id
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    return success(res, user);
  } catch (err) {
    next(err);
  }
};

// สร้าง user ใหม่
export const createUser = async (req, res, next) => {
  try {
    const data = req.body;
    const newUser = await userService.createUser(data);
    return success(res, newUser, "User created");
  } catch (err) {
    next(err);
  }
};

// อัปเดต user
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedUser = await userService.updateUser(id, data);
    return success(res, updatedUser, "User updated");
  } catch (err) {
    next(err);
  }
};

// ลบ user
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    return success(res, null, "User deleted");
  } catch (err) {
    next(err);
  }
};
