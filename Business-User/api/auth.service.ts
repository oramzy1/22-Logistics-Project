import apiClient from "./api";

export const AuthService = {
  register: async (userData: any) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },

  registerBusiness: async (formData: FormData) => {
    const response = await apiClient.post("/auth/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  login: async (credentials: { email: string; password: string; appType: 'user-app' | 'driver-app' }) => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },

  verifyEmail: async (email: string, code: string) => {
    const response = await apiClient.post("/auth/verify-email", {
      email,
      code,
    });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (email: string, code: string, newPassword: string) => {
    const response = await apiClient.post("/auth/reset-password", {
      email,
      code,
      newPassword,
    });
    return response.data;
  },

  resendVerification: async (email: string) => {
  const response = await apiClient.post("/auth/resend-verification", { email });
  return response.data;
},

verifyResetCode: async (email: string, code: string) => {
  const response = await apiClient.post("/auth/verify-reset-code", { email, code });
  return response.data;
},

  googleAuth: async (data: { idToken: string; appType: string, role: string, mode: string }) => {
  const response = await apiClient.post('/auth/google', data);
  return response.data;
},

appleAuth: async (data: { identityToken: string; fullName: any; appType: string, role: string, mode: string }) => {
  const response = await apiClient.post('/auth/apple', data);
  return response.data;
},
};