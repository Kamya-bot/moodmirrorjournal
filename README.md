# 🪞 MoodMirror — Emotion-Based Chat Journal

MoodMirror is a full-stack journaling application that transforms traditional writing into an interactive, intelligent, and engaging emotional experience.

It combines real-time journaling, mood detection, gamification, and immersive UX to help users reflect, track, and improve their mental well-being.

---

## 🚀 Live Demo
👉 Add your deployed link here

---

## ✨ Features

### 📝 Core Journaling
- Chat-style journaling interface
- Create, edit, delete entries
- Pin important entries
- Favorite meaningful memories
- Autosave drafts (persistent across reloads)

### 🧠 Mood Intelligence
- Keyword + weighted mood detection
- Negation-aware analysis
- Sentence-level interpretation
- Confidence score per entry
- AI fallback for ambiguous inputs

### 🎤 Voice Input
- Speech-to-text journaling
- Hands-free emotional logging

### 🎨 Dynamic UI Experience
- Mood-based themes (UI adapts to emotions)
- Smooth transitions and gradients
- Dark modern UI

### 🌌 Ambient Focus Mode
- Full-screen distraction-free writing
- Soft animated background
- Live timer + word count
- Seamless draft sync

### 📊 Insights & Analytics
- Mood trends (weekly/monthly)
- Most frequent mood
- Happiest and toughest days
- Average confidence score

### 📅 Monthly Recap
- Total entries
- Longest streak
- Unique journaling days
- Top mood
- Personalized reflection summary

### 🎮 Gamification
- Achievements system (badges)
- Streak tracking
- Unlockable milestones

### 💡 Engagement Features
- Daily journaling prompts
- Prompt autofill
- Favorites page with search and sorting

### 📤 Export & Data
- Export entries as CSV and JSON

### 🔒 Authentication
- Secure login/signup
- Password reset flow
- Protected routes

---

## 🛠️ Tech Stack

### Frontend
- React (TypeScript)
- React Router
- React Query
- Tailwind CSS

### Backend / Database
- Supabase (Auth + Database)
- PostgreSQL

### Libraries & Tools
- Speech Recognition API
- date-fns
- Lucide Icons
- Toast UI (Sonner)

---

## 🏗️ Architecture

Frontend (React)
↓
API Hooks (React Query)
↓
Supabase Backend
↓
PostgreSQL Database

---

## 📂 Project Structure

src/
 ├── components/
 ├── pages/
 ├── hooks/
 ├── utils/
 ├── types/
 ├── lib/
 └── styles/

---

## ⚙️ Setup Instructions

1. Clone the repository
git clone https://github.com/your-username/moodmirror.git
cd moodmirror

2. Install dependencies
npm install

3. Add environment variables (.env)
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key

4. Run the app
npm run dev

---

## 📱 Future Enhancements
- Collections / folders
- Journaling challenges
- Prompt library & templates
- Memory lane (flashbacks)
- Private vault (PIN-protected entries)
- Media attachments (images/audio)
- Notifications & reminders
- Profile customization

---

## 🎯 Highlights
- Full-stack architecture
- Real-time journaling experience
- Intelligent mood detection
- Strong UX focus (animations + themes)
- Gamification for engagement
- Production-ready

---


## 🧠 Learnings
- Scalable frontend architecture
- Async state management with React Query
- UX-focused product design
- AI-like logic without heavy ML
- Building engaging real-world applications

---

## 👤 Author

Kamya Rawat 


## ⭐ Support

If you like this project, give it a star ⭐
