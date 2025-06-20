# 🧠 Mediscan – AI-Powered Pharmacist Assistant

**Mediscan** is an AI-integrated web application designed to assist users with medical queries, analyze prescriptions, and provide contextual insights based on user history. Built using **Next.js** for the frontend and **FastAPI** for the backend, Mediscan brings intelligent health guidance directly to the user’s browser.

> ⚠️ This is a work-in-progress prototype intended for educational and research purposes.

---

## 🩺 Features

- 🔐 **User Authentication** – Secure signup and login system
- 💬 **Chat with AI Pharmacist** – Ask medical-related queries and get AI-generated responses
- 📄 **Upload Prescriptions** – Analyze uploaded prescriptions and get intelligent feedback
- 📚 **Session Storage** – Store multiple chat sessions per user for continuity and tracking
- 🔎 **Personalized Responses** – AI adjusts context based on user-provided medical history

---

## 🚀 Tech Stack

| Layer      | Technology       |
|------------|------------------|
| Frontend   | Next.js (React)  |
| Backend    | FastAPI (Python) |
| AI Engine  | OpenAI / Gemini API (planned/future)
| Auth       | JWT / OAuth (depending on final implementation)
| DB         | MongoDB / PostgreSQL (depending on config)

---

## 🧪 Getting Started

### 📦 Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
````

### 🌐 Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Make sure both servers are running and connected to the same API base URL.

---

## 📂 Project Structure

```
/frontend     # Next.js frontend
/backend      # FastAPI backend
/database     # DB models / scripts
/uploads      # Prescription images
```

---

## 📈 Future Scope

* 🔐 More sign-up methods
* 🧠 More advanced AI reasoning for drug interactions and suggestions
* 📦 Integration with drugbank database
* 📥 Prescription OCR with full text extraction
* 📝 Symptom checker and appointment recommendation engine
* 📲 Mobile app version using React Native or Flutter

---

## ⚠️ Disclaimer

Mediscan is not a certified medical device. It is not intended to replace professional medical advice, diagnosis, or treatment.

---

## 👨‍💻 Author

Built with ❤️ by **EmVi**
For learning, exploration, and real-world AI + healthcare problem solving.

---

## 📜 License

This project is released for academic and non-commercial use only.

