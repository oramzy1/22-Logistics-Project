import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = process.env.API_URL || "https://two2-logistics-project.onrender.com/api";

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
    delete config.headers["Content-Type"];
  }
  return config;
});

export default apiClient;
