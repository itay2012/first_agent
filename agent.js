import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.error("Error: GROQ_API_KEY is not set.");
  console.error("Please run: export GROQ_API_KEY=your_key_here");
  process.exit(1);
}

const groq = new Groq({ apiKey });

async function fetchWebsiteContent(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; WebAnalyzerBot/1.0)" },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  // Strip HTML tags and extract readable text
  const text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Limit to first 8000 chars to stay within token limits
  return text.slice(0, 8000);
}

async function analyzeWebsite(url) {
  console.log(`\nAnalyzing: ${url}\n${"─".repeat(50)}`);
  console.log("Fetching website content...");

  let websiteText;
  try {
    websiteText = await fetchWebsiteContent(url);
    console.log(`Fetched ${websiteText.length} characters of content.\n`);
  } catch (err) {
    console.error(`Error fetching website: ${err.message}`);
    process.exit(1);
  }

  const prompt = `Here is the text content from the website ${url}:

${websiteText}

Based on this content, please answer these three questions clearly:

1. What does this business do? (their main product or service)
2. Who are their target customers?
3. What specific services or products do they offer?

Keep each answer short and easy to understand.`;

  const result = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
  });

  console.log(result.choices[0].message.content);
}

// Main — read URL from command line args
const url = process.argv[2];
if (!url) {
  console.error("Usage: node agent.js <url>");
  console.error("Example: node agent.js https://stripe.com");
  process.exit(1);
}

analyzeWebsite(url).catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
