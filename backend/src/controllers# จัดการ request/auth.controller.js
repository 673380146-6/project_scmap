import * as authService from '../services/auth.service.js';
import { success } from '../utils/response.js';

export const login = (req, res, next) => {
  try {
    const { email, password } = req.body;
    const token = authService.login(email, password);
    return success(res, { token }, "Login successful");
  } catch (err) {
    next(err);
  }
};

export const register = (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = authService.register(email, password);
    return success(res, user, "User registered");
  } catch (err) {
    next(err);
  }
};
