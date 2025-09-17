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
