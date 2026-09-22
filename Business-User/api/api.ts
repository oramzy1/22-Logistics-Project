// Business-User App/api/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";

const API_URL =
  process.env.API_URL || "https://two2-logistics-project.onrender.com/api";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});


let unauthorizedHandler: (() => Promise<void> | void) | null = null;
let isHandlingUnauthorized = false;

export const setUnauthorizedHandler = (
  handler: (() => Promise<void> | void) | null,
) => {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = null;
  };
};


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
     const status = error?.response?.status;
    const url = error?.config?.url ?? "";
   
    if (status === 401 && !url.startsWith("/auth/") && !isHandlingUnauthorized) {
      isHandlingUnauthorized = true;

      try {
        if (unauthorizedHandler) {
          await unauthorizedHandler();
        } else {
          await AsyncStorage.multiRemove(["token", "user"]);
        }

        router.replace("/(auth)/sign-in");
      } finally {
        isHandlingUnauthorized = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
