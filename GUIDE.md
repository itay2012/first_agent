# How to Run the Website Analysis Agent

## Step 1: Get an Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Click **API Keys** in the sidebar
4. Click **Create Key**, give it a name, and copy it

---

## Step 2: Open a Terminal

- **Mac**: Press `Cmd + Space`, type `Terminal`, hit Enter
- **Windows**: Press `Win + R`, type `cmd`, hit Enter
- **Linux**: Press `Ctrl + Alt + T`

---

## Step 3: Navigate to the Project Folder

```bash
cd ~/first_agent
```

---

## Step 4: Install Dependencies

```bash
npm install
```

---

## Step 5: Set Your API Key

**Mac / Linux:**
```bash
export ANTHROPIC_API_KEY=your_api_key_here
```

**Windows (Command Prompt):**
```cmd
set ANTHROPIC_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with the key you copied in Step 1.

---

## Step 6: Run the Agent

```bash
node agent.js https://stripe.com
```

Replace `https://stripe.com` with any website URL you want to analyze.

---

## Example Output

```
Analyzing: https://stripe.com
──────────────────────────────────────────────────
Fetching website content...
Fetched 8000 characters of content.

**What the business does:**
Stripe is a financial infrastructure platform that enables businesses
to accept payments and manage their finances online.

**Who their customers are:**
Startups, small businesses, and large enterprises that need to process
online payments or build financial products.

**Services they offer:**
- Payment processing (credit cards, bank transfers, etc.)
- Billing and subscriptions
- Fraud prevention
- Payouts and financial reporting
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `command not found: node` | Install Node.js from [nodejs.org](https://nodejs.org) |
| `Error: Could not resolve authentication method` | Make sure you set `ANTHROPIC_API_KEY` in Step 5 |
| `Failed to fetch` | Check the URL is correct and includes `https://` |
