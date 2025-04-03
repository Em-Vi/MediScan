export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Auth functions
export const getCurrentUser = async (token: string) => {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

export const signup = async (email: string, password: string, fullName: string) => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, fullName }),
  });
  return response.json();
};

// Chat functions
export const sendMessage = async (userId: string, message: string, sessionId?: string) => {
  const response = await fetch(`${API_URL}/chat`, {
    
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      user_id: userId, 
      message,
      session_id: sessionId 
    }),
  });
  const data = await response.json();
  console.log("API Response:", data);
  return data;
};

export const getChatHistory = async (userId: string) => {
  const response = await fetch(`${API_URL}/history/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

export const getSessionMessages = async (userId: string, sessionId: string) => {
  const response = await fetch(`${API_URL}/history/${userId}/${sessionId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

export const uploadImage = async (userId: string, file: File) => {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("file", file);

  const response = await fetch(`${API_URL}/image/upload`, {
    method: "POST",
    body: formData,
  });
  return response.json();
};

export const analyzePrescription = async (userId: string, file: File) => {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("file", file);

  console.log(`Sending file: ${file.name}, size: ${file.size}, type: ${file.type}`);
  
  try {
    const response = await fetch(`${API_URL}/image/analyze`, {
      method: "POST",
      body: formData,
    });
    
    console.log("Response status:", response.status);
    const data = await response.json();
    console.log("Analysis response:", data);
    return data;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};

// Example usage in your component:
