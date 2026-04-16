import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";

const router = useRouter();


const API_URL =
  process.env.API_URL || "https://two2-logistics-project.onrender.com/api";

const apiClient = axios.create({
  baseURL: API_URL, 
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    // delete config.headers["Content-Type"];
    config.headers["Content-Type"] = "multipart/form-data";
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      // Dynamic import avoids circular dependency
      const { clearAuthData } = await import('../context/AuthContext').then(
        m => {
          // We can't call hooks outside components, so use AsyncStorage directly
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          return {
            clearAuthData: async () => {
              await AsyncStorage.multiRemove(['token', 'user']);
            }
          };
        }
      );
      await clearAuthData();
      // Navigate to sign-in — works from anywhere
      router.replace('/(auth)/sign-in');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
