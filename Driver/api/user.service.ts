import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./api";
import { Platform } from "react-native";

const API_URL =
  process.env.API_URL || "https://two2-logistics-project.onrender.com/api";

export const UserService = {
  getMe: async () => {
    const response = await apiClient.get("/users/me");
    return response.data;
  },

  updateProfile: async (data: { name: string; phone: string }) => {
    const response = await apiClient.patch("/users/profile", data);
    return response.data;
  },

  updateEmail: async (newEmail: string, password: string) => {
    const response = await apiClient.patch("/users/email", {
      newEmail,
      password,
    });
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.patch("/users/password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  uploadAvatar: async (imageUri: string) => {
    const token = await AsyncStorage.getItem("token");

    const safeUri =
      Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri;

    const formData = new FormData();
    formData.append("avatar", {
      uri: imageUri,
      type: "image/jpeg",
      name: "avatar.jpg",
    } as any);

    const response = await fetch(`${API_URL}/users/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      console.log("Upload error response:", text);
      let message = "Upload failed";
      try {
        const json = JSON.parse(text);
        message = json.message || message;
        console.log("Parsed error:", json);
      } catch {
        console.log("Raw error:", text);
      }
      throw new Error(message);
    }

    return response.json();
  },

  deactivateAccount: async () => {
    const response = await apiClient.patch("/users/deactivate");
    return response.data;
  },

  deleteAccount: async (password: string) => {
    const response = await apiClient.delete("/users/delete", {
      data: { password },
    });
    return response.data;
  },

     sendSupportRequest: async (data: {
    subject: string;
    description: string;
    screenshotUri?: string;
  }) => {
    // If there's a screenshot, use multipart — otherwise plain JSON is fine
    if (data.screenshotUri) {
      const token = await AsyncStorage.getItem("token");

      const formData = new FormData();
      formData.append("subject", data.subject);
      formData.append("description", data.description);

      const filename = data.screenshotUri.split("/").pop() ?? "screenshot.jpg";
      const ext = filename.split(".").pop()?.toLowerCase();
      const mimeType = ext === "png" ? "image/png" : "image/jpeg";

      formData.append("screenshot", {
        uri: data.screenshotUri,
        type: mimeType,
        name: filename,
      } as any);

      const response = await fetch(`${API_URL}/support/request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type manually — fetch sets it with the boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        let message = "Failed to send support request";
        try {
          message = JSON.parse(text)?.message ?? message;
        } catch {}
        throw new Error(message);
      }

      return response.json();
    }

    // No screenshot — plain JSON
    const response = await apiClient.post("/support/request", {
      subject: data.subject,
      description: data.description,
    });
    return response.data;
  },
};
