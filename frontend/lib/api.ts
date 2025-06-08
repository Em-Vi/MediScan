import api from "./axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const signup = async (email: string, password: string, username: string) => {
  const response = await api.post("/auth/signup", { email, password, username });
  console.log(response)
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const verifyEmail = async (token: string) => {
  const response = await api.post("/auth/verify", { token });
  return response.data;
};

export const resendEmail = async (email: string, token: string) => {
  const response = await api.post("/auth/send-verification", { email,token });
  return response.data;
}

// Chat functions
export const sendMessage = async (userId: string, message: string, chat_id?:string) => {
  const response = await api.post("/chat", {
    user_id: userId,
    chat_id: chat_id,
    message,
  });
  const data = response.data;
  console.log("API Response:", data);
  return data;
};

export const getChatHistory = async (userId: string) => {
  const response = await api.get(`/history/${userId}`);
  return response.data;
};

export const getSessionMessages = async (userId: string, sessionId: string) => {
  const response = await api.get(`/history/${userId}/${sessionId}`);
  return response.data;
};

export const uploadImage = async (userId: string, file: File) => {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("file", file);

  const response = await api.post("/image/upload", formData);
  return response.data;
};

export const analyzePrescription = async (userId: string, file: File) => {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("file", file);

  console.log(`Sending file: ${file.name}, size: ${file.size}, type: ${file.type}`);

  try {
    const response = await api.post("/image/analyze", formData);
    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};

export const deleteChatSession = async (userId: string, sessionId: string) => {
  const response = await api.delete(`/history/${userId}/${sessionId}`);
  return response.data;
}

export const googleSignInApi = async () => {
  try {
    const response = await api.post("/auth/google", {}, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error during Google Sign-In:", error);
    throw error;
  }
};


