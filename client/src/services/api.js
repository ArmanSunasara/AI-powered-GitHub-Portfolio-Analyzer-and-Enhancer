import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api/github`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

export const analyzeGithubProfile = async (url) => {
  try {
    const response = await api.post("/analyze", { url });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      return {
        success: false,
        error: "Request timed out. Please try again.",
      };
    }
    return {
      success: false,
      error:
        error.response?.data?.error ||
        error.message ||
        "Failed to analyze GitHub profile",
    };
  }
};

export default api;
