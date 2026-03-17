# How to Run the Website Analysis Agent
### (Beginner Friendly - No experience needed)

---

## Step 1: Get Your Free Google API Key

1. Open your web browser and go to: **https://aistudio.google.com**
2. Sign in with your Google account
3. Click **Get API Key**
4. Click **Create API Key**
5. Copy the key that appears — it looks like: `AIzaSy...`
6. Paste it somewhere safe like your Notes app

> **Important:** Never share this key with anyone. Treat it like a password.

---

## Step 2: Open the Terminal

The terminal is a text window where you type commands.

- **Mac**: Press `Cmd + Space`, type `Terminal`, press Enter
- **Windows**: Press `Windows key + R`, type `cmd`, press Enter
- **Linux**: Press `Ctrl + Alt + T`

---

## Step 3: Go to the Project Folder

Type this and press Enter:

```
cd ~/first_agent
```

---

## Step 4: Install the Required Files

Type this and press Enter:

```
npm install
```

Wait for it to finish (about 30 seconds).

---

## Step 5: Enter Your API Key

This tells the agent to use your Google account.

**On Mac or Linux:**
```
export GOOGLE_API_KEY=PASTE_YOUR_KEY_HERE
```

**On Windows:**
```
set GOOGLE_API_KEY=PASTE_YOUR_KEY_HERE
```

Replace `PASTE_YOUR_KEY_HERE` with the key you copied in Step 1.

Example:
```
export GOOGLE_API_KEY=AIzaSyAbc123xyz...
```

---

## Step 6: Run the Agent

Type this and press Enter:

```
node agent.js https://stripe.com
```

Replace `https://stripe.com` with any website you want to analyze:

```
node agent.js https://apple.com
```

```
node agent.js https://airbnb.com
```

---

## What You Will See

```
Analyzing: https://stripe.com
──────────────────────────────────────────────────
Fetching website content...
Fetched 8000 characters of content.

1. What does this business do?
Stripe helps businesses accept payments online.

2. Who are their target customers?
Small businesses, startups, and large companies.

3. What services do they offer?
- Online payment processing
- Subscriptions and billing
- Fraud protection
```

---

## Something Went Wrong?

| What you see | What to do |
|---|---|
| `command not found: node` | Download Node.js from **https://nodejs.org** and install it |
| `GOOGLE_API_KEY is not set` | You forgot Step 5 — go back and enter your key |
| `Failed to fetch` | Make sure the URL starts with `https://` |
| Nothing happens | Make sure you pressed Enter after typing the command |

---

## Running It Again Later?

Every time you open a new terminal window, repeat **Steps 3, 5, and 6**.
The API key does not save automatically when you close the terminal.
