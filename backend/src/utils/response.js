export const sendSuccess = (res, data, message = 'OK', statusCode = 200) => {
  return res.status(statusCode).json({ 
    success: true, 
    message, 
    data 
  });
};

export const sendError = (res, message = 'Error', statusCode = 500) => {
  return res.status(statusCode).json({ 
    success: false, 
    message,
    data: null
  });
};

// Alias สำหรับใช้งานง่าย
export const success = (res, data, message = "OK") => {
  return sendSuccess(res, data, message);
};

export const error = (res, message = "Error", statusCode = 500) => {
  return sendError(res, message, statusCode);
};
