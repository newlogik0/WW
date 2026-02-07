# Warrior's Way - Fitness RPG Tracker

## Original Problem Statement
Build a fitness tracker app that functions like an RPG, named "Warrior's Way". Track weightlifting and cardio workouts with RPG elements like XP, leveling, stats (Strength, Endurance, Agility), badges/achievements, and a quest system.

## User Personas
- Fitness enthusiasts who enjoy gamification
- Weightlifters tracking sets, reps, weights with tempo guidance
- Cardio athletes tracking duration and distance
- Users wanting an engaging, RPG-themed workout experience

## Core Requirements

### Authentication
- [x] JWT-based login/register with email
- [x] Login with username or email
- [x] Google OAuth Sign-up/Login (Emergent-managed)
- [x] **Face Recognition Login** (face-api.js integration)
- [x] **"Remember Me" feature** (30-day token vs 7-day)
- [ ] Apple Account Sign-up (Future)

### Workout Tracking
- [x] Weightlifting sessions with exercises, sets, reps, weights
- [x] Per-set weight tracking with useSameWeight toggle
- [x] Rep Tempo Tracker with sound guidance
- [x] Rest timer between sets
- [x] Push/Pull/Leg exercise categorization
- [x] Live sync between training plans and workout sessions
- [x] Cardio sessions with activity, duration, distance
- [x] Cardio countdown timer
- [x] Editable workout history and notes

### RPG Elements
- [x] XP system with leveling (100 + (level-1)*150 XP per level)
- [x] Stats: Strength, Endurance, Agility
- [x] Achievements/Badges system
- [x] Daily and Weekly Quests
- [x] Leaderboard

### AI Features
- [x] AI-powered training plan import (PDF, images, text)
- [x] Exercise categorization into Push/Pull/Legs

### UI/UX
- [x] Professional dark theme with teal/cyan accents - ALL PAGES COMPLETE
- [x] Gym Attendance Calendar (color-coded by session type)
- [x] Consistent styling across all components (no purple)

## What's Been Implemented

### Feb 2026 - UI Redesign Complete
- Applied consistent dark theme with teal/cyan (#00d9ff) accents across ALL pages
- Replaced all purple (#8b5cf6, #7c3aed, #a78bfa) colors with teal
- Updated Navbar to use Dumbbell icon instead of Shield
- Fixed WeightliftingSession.jsx - all purple buttons/inputs now teal
- Fixed App.css legacy purple classes

### Feb 2026 - Face Recognition & Remember Me
- Full face-api.js integration for facial recognition login
- "Remember Me" checkbox on login (30-day token expiry)
- Face registration in Profile page
- Backend face descriptor storage and cosine similarity matching
- Downloaded face-api.js models: tinyFaceDetector, faceLandmark68, faceRecognition

### Previous Work
- Complete JWT and Google OAuth authentication
- Full workout logging system (weightlifting + cardio)
- RPG mechanics (XP, levels, stats, achievements, quests)
- AI training plan importer
- Gym calendar with PPL color coding
- Per-set weight tracking
- Rest timers and tempo tracker

## Tech Stack
- **Frontend:** React, Tailwind CSS, Shadcn/UI, face-api.js
- **Backend:** FastAPI, MongoDB (motor), Pydantic
- **Auth:** JWT (passlib, python-jose), Emergent Google OAuth
- **AI:** emergentintegrations (Gemini for plan parsing)

## Key API Endpoints
- `/api/auth/login` - Email/username login with remember_me
- `/api/auth/face/login` - Face recognition login
- `/api/auth/face/register` - Register face for a user
- `/api/auth/google/session` - Google OAuth
- `/api/workouts/weightlifting` - Log weightlifting session
- `/api/workouts/cardio` - Log cardio session
- `/api/plans/import` - AI training plan import
- `/api/achievements` - Get user achievements
- `/api/quests` - Get active quests

## Database Schema
- **users:** id, username, email, password_hash, face_descriptor, level, xp, stats...
- **workouts:** id, user_id, workout_type, session_category, exercises, details...
- **training_plans:** id, user_id, name, exercises (with category)
- **achievements:** id, user_id, name, unlocked, condition
- **quests:** id, user_id, name, progress, target, expires_at

## Prioritized Backlog

### P0 (Critical)
- [x] ~~Face Recognition Login~~
- [x] ~~Remember Me feature~~
- [x] ~~Complete UI redesign for consistency (teal theme all pages)~~

### P1 (High)
- [ ] Apple Account Sign-up

### P2 (Medium)
- [ ] Fully customizable avatars
- [ ] Icon improvements (more RPG-themed)
- [ ] Social features (parties, trading, inventory)

### P3 (Low)
- [ ] "Gamify Your Life" tracker
- [ ] AR/VR integration

## Test Credentials
- Username: facetest
- Email: facetest@example.com
- Password: test123456
- Face: Registered for testing

## Files Reference
- `/app/backend/server.py` - Main backend with all routes
- `/app/frontend/src/components/FaceAuth.jsx` - Face auth component
- `/app/frontend/src/pages/Login.jsx` - Login with face auth & remember me
- `/app/frontend/src/pages/Profile.jsx` - Profile with face registration
- `/app/frontend/public/models/` - face-api.js model files
