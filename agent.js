import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error("Error: GOOGLE_API_KEY is not set.");
  console.error("Please run: export GOOGLE_API_KEY=your_key_here");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  console.log(response);
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
