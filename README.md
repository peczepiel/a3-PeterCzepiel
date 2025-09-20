# Click Game — Assignment 3 (CS4241)

**Title:** Click Game — Persistence  
**Deployed:** `https://a3-PeterCzepiel.onrender.com`

A simple 10-second clicker game extended from A2: users register/login, play a timed run, and save/edit/delete their scores. The app uses an Express server and MongoDB for persistent per-user data, and a CSS framework for layout.

---

## Quick start

1. Install dependencies:
npm install

2. Create a .env from .env.example and set at minimum:
MONGODB_URI=mongodb://localhost:27017/clickgame
SESSION_SECRET=your_secret_here
PORT=3000

3. Start the Server:
npm start

4. Open http://localhost:3000 (or your PORT).

---

## What I implemented:
-Express server with JSON API and static frontend.
-MongoDB persistence (Mongoose) with User and Score models.
-Session-based auth (register / login / logout) + bcrypt hashing.
-Playable client: 10s runs, live counter, save/edit/delete personal scores.
-Responsive UI using a CSS framework (Bootstrap) + minor custom CSS.

---

## Data Models

1. User
  - username
  - passwordHash
  - createdAt

2. Score
  - user
  - name
  - score
  - clicksPerSecond
  - createdAt

---

## How To Play

1. Register or login.

2. Enter an optional run name and press Start.

3. Click the big button for 10 seconds.

4. Score is saved to your account and appears on your results page (edit/delete allowed).

## Achievements:

Technical:

- Instead of using Render, I have chose to host on CloudFlare

Design/UX:

-