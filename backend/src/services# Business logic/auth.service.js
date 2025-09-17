export const login = (email, password) => {
  if (email === 'test@example.com' && password === '1234') {
    return "mock-jwt-token";
  }
  throw new Error("Invalid credentials");
};

export const register = (email, password) => {
  return { id: 1, email, password: "***" };
};
