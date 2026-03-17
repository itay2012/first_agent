import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

async function fetchWebsiteContent(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; WebAnalyzerBot/1.0)",
    },
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

  const tools = [
    {
      name: "fetch_website",
      description:
        "Fetches the content of a website URL and returns the readable text content.",
      input_schema: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The full URL of the website to fetch",
          },
        },
        required: ["url"],
      },
    },
  ];

  const messages = [
    {
      role: "user",
      content: `Please analyze the website at ${url}. Use the fetch_website tool to get its content, then tell me:
1. What the business does (their main product or service)
2. Who their target customers are
3. What specific services or products they offer

Be concise and structured in your response.`,
    },
  ];

  // Agentic loop
  while (true) {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      tools,
      messages,
    });

    if (response.stop_reason === "end_turn") {
      // Print final response
      for (const block of response.content) {
        if (block.type === "text") {
          console.log(block.text);
        }
      }
      break;
    }

    if (response.stop_reason === "tool_use") {
      messages.push({ role: "assistant", content: response.content });

      const toolResults = [];
      for (const block of response.content) {
        if (block.type === "tool_use" && block.name === "fetch_website") {
          console.log(`Fetching website content...`);
          let result;
          try {
            result = await fetchWebsiteContent(block.input.url);
            console.log(`Fetched ${result.length} characters of content.\n`);
          } catch (err) {
            result = `Error fetching website: ${err.message}`;
            console.error(result);
          }
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: result,
          });
        }
      }

      messages.push({ role: "user", content: toolResults });
    } else {
      // Unexpected stop reason
      break;
    }
  }
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
