# Click Game — Assignment 3 (CS4241)

**Title:** Click Game — Persistence  
**Deployed:** `https://a3-peterczepiel-production.up.railway.app/` 

A simple 10-second clicker game extended from A2: users register/login, play a timed run, and save/edit/delete their scores. The app uses an Express server and MongoDB for persistent per-user data, and a CSS framework for layout. Please use the below logins for grading purposes on Render.

Grader Login for Testing:
  - Username: grader@example.com
  - Password: graderpass123

Another Example Account Created on Render:
  - Username: billgates@apple.com
  - Password: 123456

---

## Quick start

1. Install dependencies:
npm install

2. (if running locally) 
  - Run MongoDB locally
  - Create a .env from .env.example and set at minimum:
  - MONGODB_URI=mongodb://localhost:27017/clickgame
  - SESSION_SECRET=your_secret_here  (can fill with random characters)
  - PORT=3000

3. Start the Server:
npm start

4. Open http://localhost:3000 (or your PORT).

---

## What I implemented:
- Express server with JSON API and static frontend.
- MongoDB persistence (Mongoose) with User and Score models.
- Session-based auth (register / login / logout) + bcrypt hashing.
- Playable client: 10s runs, live counter, save/edit/delete personal scores.
- Responsive UI using a CSS framework (Bootstrap) + minor custom CSS.
- This site (deployed through Railway) has atleast a 90% in all 4 Google Lighthouse Categories

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

- Used a Hosting Service other than Render: I am hosting my website using Railway, as suggested from one of my other classmates. I am using a free trial which allows me to host free of charge. I found it a bit easier to understand then Render as all I had to do was login to Github and add variables from my .env file. The only thing that was worse is it took me a few moments to find where to create a URL for the website, which Render makes very clear.

Design/UX:

- Twelve W3C accessibility tips I implemented

  1. Provide Clear and Consistent Navigation Options: I added a focusable "Skip to main content" link at the top of `index.html` so keyboard users can jump straight to the playable area. I also added CSS in `main.css` to make it visible on focus.

  2. Use Headings to Convey Meaning and Structure: the main area is wrapped in `<main id="mainContent">` and the header/footer structure is preserved so screen readers can navigate the page easily (see `index.html`). I also added clear focus styles for the skip link and the click button in `main.css` so keyboard users can see where focus is and what to interact with next. I also made sure the scores table has a caption (visually hidden) and proper `<th>` headers so screen readers can describe the table structure and users can understand the data (`index.html`).

  3. Provide Easily Identifable Feedback: game status, timer and auth messages use `role="status"` and `aria-live="polite"` so screen readers announce changes without needing extra user action (`index.html`, `main.js`). I also made the click button is given `aria-pressed` / `aria-disabled` semantics and `disabled` is toggled programmatically during runs so screen readers and assistive tech see the current state (`main.js`).

  4. Provide Meaning for Non-Standard Interactive Elements: important buttons (Start Game and the click target) include `aria-label` attributes so their purpose is explicit to assistive tech (`index.html`).

  5. Provide Informative, Unique Page Titles: I only have 1 page for my game, but I made sure this page has `<title>` set to "Click Game - High Scores" in `index.html`. This provides the page with an informative and unique title for accessibility purposes.

  6. Ensure All Interactive Elements are Keyboard Accessible: the click target can be activated with Space/Enter (I added a keydown handler in `main.js`) so users who rely on keyboard input can play the game fully.

  7. Helps Users Avoid and Correct Mistakes: login/register inputs include `autocomplete` (`email`, `current-password`, `new-password`) so password managers and keyboard users have a smoother experience (`index.html`).

  8. Write Code that Adapts to the User's Technology: when a run starts the click button receives focus via JavaScript so keyboard and screen-reader users are moved to the active control automatically (`main.js`).

  9. Identify Page Language and Language Changes: I made sure that in my `<root>` tag in `index.html` the language was set to `lang=en` to make sure anyone trying to access the page knows it is only in English and doesn't feature any other languages.

  10. Provide Clear Instructions: In my login/register form and play section, I made sure to put in some helper text that explains what the user should do to both login/register and play the game affectively.

  11. Group related controls: action buttons in each score row are grouped with `.btn-group` so related controls are adjacent both visually and programmatically (HTML structure in `index.html`).

  12. Ensure that Form Elements Include Clearly Associated Labels: all form fields have `<label>` elements, buttons use human-readable text, and `aria-label`s are added where additional clarity is needed; this makes interactions predictable and easier to understand for assistive tech (changes in `index.html`).


- CRAP Principles

  1. Contrast:

  I leaned into contrast on purpose because I wanted the important parts to be obvious without having to explain anything. The whole site sits on a dark background so the headings and CTAs pop. I used gold (`color: #ffcc00;`) for titles and section headers in `main.css` so they immediately draw your eye, and I made the main action stand out by size and color: the large green button becomes the only thing people look at when playing the actual game. Before you start, the `Start Game` button contrasts strongly with the card it sits in; during play, the big green click box dominates. I also relied on Bootstrap button variants and table striping to separate actions from data visually. In conclusion, contrast is done with color, size, and placement so the title, the start button, and the click target are the things you notice first. The files where I tuned these choices are `index.html`, `main.css`, and `main.js` (which toggles the visible state so the emphasized element changes when you play).

  2. Repetition:

  I used repetition as a fast way to make the UI feel intentional and predictable. The site uses the Roboto font everywhere (loaded from Google Fonts in `index.html`), and I repeatedly use Bootstrap components (cards, form controls, and button styles) so once you understand one control you understand them all. I repeated all my color cues too, using gold highlights for headings and yellow/green button accents for primary actions show up in multiple places so the meaning of a color becomes familiar (start/save = yellow/green, etc.). Layout modules repeat: `.card .card-body` is the container pattern for both auth and play areas, and every score row has the same action group (edit/save/cancel/delete) implemented as a `.btn-group`. Even the client/server validation is mirrored — fields checked in `main.js` match the express-validator rules in `server.js` — which reinforces consistent behavior. Repeating these elements reduces friction, and makes it so the user doesn't have to relearn controls as they move through the app.

  3. Alignment:

  Alignment was mostly handled with Bootstrap utilities and small CSS rules so content reads cleanly and scans quickly. The header uses a flex layout so the title sits left and user/session info sits right. This gives the page a stable horizontal axis. In the main area the two-column grid lines up the auth card and the play card so they feel related but separate, and form labels are stacked immediately above inputs to keep visual rhythm. The scoreboard uses table column alignment (labels left, numbers right/center where appropriate) so it’s easier to compare runs at a glance, and action buttons are grouped to the side of each row for quick access. The play area itself is centered with `display:flex; flex-direction:column; align-items:center;` so timer, count, and click target sit on a single vertical line. This alignment isolates the interaction and increases contrast by making the click target the focal point.

  4. Proximity:

  Proximity was my goto rule for reducing noise and making the page predictable. Related controls and feedback are placed close together: login inputs, their messages, and the register toggle are all within the same card so user state changes happen where you’re already looking. The game controls (run label, start button) are grouped in the play card and the live stats (timer, click count, click button) are inside the game area so while playing everything you need is physically clustered. The results table keeps each score’s data and its action buttons within the same row, and the action buttons themselves are a `.btn-group` so edit and delete feel like a single unit. I also used show/hide toggles in `main.js` instead of moving the user to a different page, which preserves proximity — when you sign in the forms hide and the game controls appear right where you expect them. The overall effect is that the page is easily readable: things that belong together sit together, so it’s faster to act and harder to get lost.
