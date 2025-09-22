# Click Game — Assignment 3 (CS4241)

**Title:** Click Game — Persistence  
**Deployed:** `https://a3-peterczepiel.onrender.com/`

A simple 10-second clicker game extended from A2: users register/login, play a timed run, and save/edit/delete their scores. The app uses an Express server and MongoDB for persistent per-user data, and a CSS framework for layout. Please use the below logins for grading purposes on Render.

Grader Login for Testing:
Username: grader@example.com
Password: graderpass123

Another Example Account Created on Render:
Username: billgates@apple.com
Password: 123456

---

## Quick start

1. Install dependencies:
npm install

2. (if running locally) 
-Run MongoDB locally
-Create a .env from .env.example and set at minimum:
-MONGODB_URI=mongodb://localhost:27017/clickgame
-SESSION_SECRET=your_secret_here  (can fill with random characters)
-PORT=3000

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
-This site (deployed through Render) has atleast a 90% in all 4 Google Lighthouse Categories

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

2. Enter a run name and press Start.

3. Click the big button for 10 seconds.

4. Score is saved to your account and appears on the below results page (edit/delete allowed).

## Achievements:

Technical:

- None

Design/UX:

- None
