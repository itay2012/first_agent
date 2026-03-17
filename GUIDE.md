# How to Run the Website Analysis Agent
### (Beginner Friendly - No experience needed)

---

## Step 1: Get Your API Key

This is like a password that lets you use the AI.

1. Open your web browser (Chrome, Firefox, Safari, etc.)
2. Go to this website: **https://console.anthropic.com**
3. Click **Sign Up** and create a free account
4. Once logged in, look on the left side and click **API Keys**
5. Click the button that says **Create Key**
6. Type any name you want (example: "my-agent")
7. Click **Create Key**
8. You will see a long code like this: `sk-ant-api03-xxxxxx...`
9. **Copy that code and paste it somewhere safe** (like a notes app) — you will need it later

---

## Step 2: Open the Terminal

The terminal is a text-based window where you type commands.

- **Mac**: Press `Cmd + Space` at the same time, type `Terminal`, then press Enter
- **Windows**: Press the `Windows key + R` at the same time, type `cmd`, then press Enter
- **Linux**: Press `Ctrl + Alt + T` at the same time

A black or white window will open. That is the terminal.

---

## Step 3: Go to the Project Folder

In the terminal, type this exactly and press Enter:

```
cd ~/first_agent
```

This moves you into the folder where the agent is saved.

---

## Step 4: Install the Required Files

Type this and press Enter:

```
npm install
```

You will see some text appear. Wait for it to finish (it takes about 30 seconds).

---

## Step 5: Enter Your API Key

This tells the agent to use your account.

**On Mac or Linux**, type this and press Enter — but replace `PASTE_YOUR_KEY_HERE` with the key you copied in Step 1:

```
export ANTHROPIC_API_KEY=PASTE_YOUR_KEY_HERE
```

**On Windows**, type this instead:

```
set ANTHROPIC_API_KEY=PASTE_YOUR_KEY_HERE
```

Example of what it should look like:
```
export ANTHROPIC_API_KEY=sk-ant-api03-abc123xyz...
```

> **Important:** Do not share this key with anyone. Treat it like a password.

---

## Step 6: Run the Agent

Now you are ready! Type this and press Enter:

```
node agent.js https://stripe.com
```

The agent will visit the website and tell you what the business does.

You can replace `https://stripe.com` with **any website you want**, for example:

```
node agent.js https://apple.com
```

```
node agent.js https://airbnb.com
```

---

## What You Will See

After running it, the agent will print something like this:

```
Analyzing: https://stripe.com
──────────────────────────────────────────────────
Fetching website content...
Fetched 8000 characters of content.

What the business does:
Stripe helps businesses accept payments online.

Who their customers are:
Small businesses, startups, and large companies.

What services they offer:
- Online payment processing
- Subscriptions and billing
- Fraud protection
```

---

## Something Went Wrong?

| What you see | What to do |
|---|---|
| `command not found: node` | Download and install Node.js from **https://nodejs.org** — click the big green button |
| `Could not resolve authentication` | You forgot to do Step 5, or made a typo in the key |
| `Failed to fetch` | Make sure the website address starts with `https://` |
| Nothing happens | Make sure you pressed Enter after typing the command |

---

## Need to Run It Again Later?

Every time you open a new terminal window, you need to repeat **Step 3, Step 5, and Step 6**. The API key does not save automatically.
