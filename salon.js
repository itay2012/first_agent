/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║          💇 STUDIO SHIRA — סטודיו שירה 💇                  ║
 * ║          Dizengoff Street, Tel Aviv                         ║
 * ║          Business Assistant Agent                           ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * HOW TO USE / איך להשתמש:
 * ─────────────────────────────────────────────────────────────
 *  CUSTOMERS / לקוחות:
 *   • Type "book"        — Book a new appointment
 *   • Type "cancel"      — Cancel an existing booking
 *   • Type anything else — Chat with our AI assistant (Hebrew & English)
 *
 *  OWNER / לשירה:
 *   • Type "show schedule" — View today's full schedule
 *
 *  EXIT:
 *   • Type "exit" or "quit" to close
 * ─────────────────────────────────────────────────────────────
 */

import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── File paths ───────────────────────────────────────────────
const BOOKINGS_FILE = path.join(__dirname, "bookings.json");
const UNANSWERED_FILE = path.join(__dirname, "unanswered.json");

// ─── Services ─────────────────────────────────────────────────
const SERVICES = {
  haircut: { name: "Haircut / תספורת", price: 200, duration: 45, durationText: "45 min" },
  color: { name: "Color Treatment / צביעה", price: 450, duration: 120, durationText: "2 hours" },
  blowout: { name: "Blowout / פן", price: 150, duration: 30, durationText: "30 min" },
  treatment: { name: "Hair Treatment / טיפול שיער", price: 350, duration: 90, durationText: "1.5 hours" },
};

// ─── Groq client ──────────────────────────────────────────────
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Data helpers ─────────────────────────────────────────────
function loadBookings() {
  if (!fs.existsSync(BOOKINGS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(BOOKINGS_FILE, "utf8")); }
  catch { return []; }
}

function saveBookings(bookings) {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

function loadUnanswered() {
  if (!fs.existsSync(UNANSWERED_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(UNANSWERED_FILE, "utf8")); }
  catch { return []; }
}

function saveUnanswered(list) {
  fs.writeFileSync(UNANSWERED_FILE, JSON.stringify(list, null, 2));
}

function generateRef() {
  return "SHIRA-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ─── Booking logic ────────────────────────────────────────────
function parseDateTime(input) {
  // Accept formats like "2024-05-20 14:00", "20/05 14:00", "tomorrow 15:30", etc.
  const normalized = input.trim();
  const dt = new Date(normalized);
  if (!isNaN(dt.getTime())) return dt;

  // Try DD/MM/YYYY HH:MM
  const ddmm = normalized.match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?\s+(\d{1,2}):(\d{2})/);
  if (ddmm) {
    const [, d, m, y, h, min] = ddmm;
    const year = y || new Date().getFullYear();
    return new Date(`${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T${h.padStart(2, "0")}:${min}:00`);
  }
  return null;
}

function isSlotTaken(bookings, serviceKey, requestedDt) {
  const service = SERVICES[serviceKey];
  const reqStart = requestedDt.getTime();
  const reqEnd = reqStart + service.duration * 60 * 1000;

  return bookings
    .filter((b) => b.status !== "cancelled")
    .some((b) => {
      const bStart = new Date(b.datetime).getTime();
      const bEnd = bStart + SERVICES[b.serviceKey].duration * 60 * 1000;
      return reqStart < bEnd && reqEnd > bStart;
    });
}

// ─── Readline helper ──────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

// ─── Booking flow ─────────────────────────────────────────────
async function bookingFlow() {
  console.log("\n╔════════════════════════════════════════╗");
  console.log("║      📅 NEW APPOINTMENT / תור חדש      ║");
  console.log("╚════════════════════════════════════════╝\n");

  // Name
  const name = (await ask("  👤 Your full name / שם מלא: ")).trim();
  if (!name) { console.log("  ❌ Name is required."); return; }

  // Phone
  const phone = (await ask("  📞 Phone number / מספר טלפון: ")).trim();
  if (!phone) { console.log("  ❌ Phone is required."); return; }

  // Service menu
  console.log("\n  💅 Available services / שירותים זמינים:\n");
  const keys = Object.keys(SERVICES);
  keys.forEach((k, i) => {
    const s = SERVICES[k];
    console.log(`     [${i + 1}] ${s.name}`);
    console.log(`         ₪${s.price}  ·  ${s.durationText}`);
  });
  console.log();

  const serviceInput = (await ask("  Choose a service (1-4) / בחר שירות: ")).trim();
  const serviceIdx = parseInt(serviceInput, 10) - 1;
  if (isNaN(serviceIdx) || serviceIdx < 0 || serviceIdx >= keys.length) {
    console.log("  ❌ Invalid choice.");
    return;
  }
  const serviceKey = keys[serviceIdx];
  const service = SERVICES[serviceKey];

  // Date & time
  console.log("\n  📆 Enter date & time (e.g. 2025-06-15 14:00 or DD/MM HH:MM)");
  const datetimeInput = (await ask("  Date & time / תאריך ושעה: ")).trim();
  const dt = parseDateTime(datetimeInput);
  if (!dt || isNaN(dt.getTime())) {
    console.log("  ❌ Could not parse date/time. Please try again.");
    return;
  }
  if (dt < new Date()) {
    console.log("  ❌ That time is in the past. Please choose a future time.");
    return;
  }

  // Check availability
  const bookings = loadBookings();
  if (isSlotTaken(bookings, serviceKey, dt)) {
    console.log("\n  ⛔ Sorry! That time slot is already taken / הזמן הזה תפוס.");
    console.log("  Please choose a different time. / אנא בחר/י זמן אחר.\n");
    return;
  }

  // Save booking
  const ref = generateRef();
  const booking = {
    ref,
    name,
    phone,
    serviceKey,
    serviceName: service.name,
    price: service.price,
    duration: service.duration,
    datetime: dt.toISOString(),
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);
  saveBookings(bookings);

  // Confirmation
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   ✅ BOOKING CONFIRMED / התור אושר!          ║");
  console.log("╠══════════════════════════════════════════════╣");
  console.log(`║  Ref #:    ${ref.padEnd(34)}║`);
  console.log(`║  Name:     ${name.substring(0, 34).padEnd(34)}║`);
  console.log(`║  Service:  ${service.name.substring(0, 34).padEnd(34)}║`);
  console.log(`║  Price:    ₪${String(service.price).padEnd(33)}║`);
  console.log(`║  Duration: ${service.durationText.padEnd(34)}║`);
  console.log(`║  When:     ${dt.toLocaleString("he-IL").substring(0, 34).padEnd(34)}║`);
  console.log("╚══════════════════════════════════════════════╝");
  console.log("  Keep your reference number safe! / שמור/י את מספר ההזמנה!\n");

  // Smart suggestions
  if (serviceKey === "haircut") {
    console.log("  💡 Tip: Add a Blowout / פן for only ₪50 extra (30 min)!");
    console.log("     Just book another appointment right after your haircut.\n");
  } else if (serviceKey === "color") {
    console.log("  💡 Tip: Add a Hair Treatment / טיפול שיער for only ₪100 extra (1.5h)!");
    console.log("     Book it right after your color for amazing results!\n");
  }
}

// ─── Cancellation flow ────────────────────────────────────────
async function cancellationFlow() {
  console.log("\n╔════════════════════════════════════════╗");
  console.log("║    ❌ CANCEL BOOKING / ביטול תור        ║");
  console.log("╚════════════════════════════════════════╝\n");

  const ref = (await ask("  Enter your booking reference / מספר הזמנה (e.g. SHIRA-ABC123): "))
    .trim()
    .toUpperCase();
  if (!ref) { console.log("  ❌ Reference number required."); return; }

  const bookings = loadBookings();
  const idx = bookings.findIndex((b) => b.ref === ref);

  if (idx === -1) {
    console.log("  ❌ Booking not found. Please check your reference number.");
    return;
  }

  const booking = bookings[idx];
  if (booking.status === "cancelled") {
    console.log("  ⚠️  This booking was already cancelled.");
    return;
  }

  bookings[idx].status = "cancelled";
  bookings[idx].cancelledAt = new Date().toISOString();
  saveBookings(bookings);

  console.log("\n  ✅ Booking cancelled successfully / התור בוטל בהצלחה!\n");
  console.log(`  Ref:     ${booking.ref}`);
  console.log(`  Name:    ${booking.name}`);
  console.log(`  Service: ${booking.serviceName}`);
  console.log(`  Was:     ${new Date(booking.datetime).toLocaleString("he-IL")}`);
  console.log("\n  The time slot is now available for new bookings.");
  console.log("  We hope to see you again soon! / נשמח לראותך שוב! 💙\n");
}

// ─── Daily schedule ───────────────────────────────────────────
function showSchedule() {
  const bookings = loadBookings();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todays = bookings
    .filter((b) => {
      const dt = new Date(b.datetime);
      return dt >= today && dt < tomorrow && b.status !== "cancelled";
    })
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  const dateStr = today.toLocaleDateString("he-IL", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log(`║  📋 SCHEDULE / לוח זמנים — ${dateStr.substring(0, 28).padEnd(28)}║`);
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  if (todays.length === 0) {
    console.log("  No bookings for today. / אין תורים להיום.\n");
    return;
  }

  todays.forEach((b, i) => {
    const dt = new Date(b.datetime);
    const endDt = new Date(dt.getTime() + b.duration * 60 * 1000);
    const timeStr = `${dt.getHours().toString().padStart(2, "0")}:${dt.getMinutes().toString().padStart(2, "0")}`;
    const endStr = `${endDt.getHours().toString().padStart(2, "0")}:${endDt.getMinutes().toString().padStart(2, "0")}`;

    console.log(`  ┌─ ${i + 1}. ${timeStr} – ${endStr} ─────────────────────────────`);
    console.log(`  │  👤 ${b.name}`);
    console.log(`  │  💅 ${b.serviceName}`);
    console.log(`  │  ⏱  ${SERVICES[b.serviceKey].durationText}  ·  ₪${b.price}`);
    console.log(`  │  📞 ${b.phone}`);
    console.log(`  │  🔖 ${b.ref}`);
    console.log("  └─────────────────────────────────────────────────────\n");
  });

  console.log(`  Total: ${todays.length} appointment(s) today.\n`);
}

// ─── AI chat ──────────────────────────────────────────────────
const conversationHistory = [];

const SYSTEM_PROMPT = `You are the virtual receptionist for Studio Shira (סטודיו שירה), a premier hair salon on Dizengoff Street in Tel Aviv.

Your personality: warm, friendly, professional, and stylish — like a real Tel Aviv salon receptionist. You speak both Hebrew and English naturally, switching based on the customer's language.

About the salon:
- Name: Studio Shira (סטודיו שירה)
- Location: Dizengoff Street, Tel Aviv
- Owner: Shira
- Vibe: Modern, welcoming, professional

Services and prices:
- Haircut / תספורת: ₪200, 45 minutes
- Color Treatment / צביעה: ₪450, 2 hours
- Blowout / פן: ₪150, 30 minutes
- Hair Treatment / טיפול שיער: ₪350, 1.5 hours

Smart suggestions (always mention these naturally):
- After a haircut → suggest adding a Blowout for only ₪50 extra
- After a color treatment → suggest adding a Hair Treatment for only ₪100 extra

Booking guidance:
- To book: type "book"
- To cancel: type "cancel"
- To see today's schedule (for Shira): type "show schedule"

IMPORTANT: If someone asks you something you genuinely cannot answer (e.g., specific staff availability, custom pricing, medical questions about hair), you MUST respond with exactly this phrase somewhere in your reply: "I will pass this to Shira directly" (or the Hebrew equivalent: "אעביר את זה לשירה ישירות"). This is a signal to the system to save the question.

Always be enthusiastic about hair and beauty. Use emojis sparingly for warmth. Keep responses concise and helpful.`;

async function chatWithAI(userMessage) {
  conversationHistory.push({ role: "user", content: userMessage });

  try {
    const stream = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversationHistory,
      ],
    });

    process.stdout.write("\n  🤖 Studio Shira: ");

    let fullText = "";
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? "";
      process.stdout.write(delta);
      fullText += delta;
    }
    console.log("\n");

    conversationHistory.push({ role: "assistant", content: fullText });

    // Check if AI couldn't answer — save to unanswered.json
    const escalationPhrases = [
      "i will pass this to shira",
      "אעביר את זה לשירה",
      "pass this to shira",
    ];
    const lowerText = fullText.toLowerCase();
    if (escalationPhrases.some((p) => lowerText.includes(p))) {
      const unanswered = loadUnanswered();
      unanswered.push({
        question: userMessage,
        timestamp: new Date().toISOString(),
        aiResponse: fullText,
      });
      saveUnanswered(unanswered);
      console.log("  📩 [Question saved for Shira / השאלה נשמרה לשירה]\n");
    }
  } catch (err) {
    console.log("\n  ❌ Error communicating with AI:", err.message, "\n");
  }
}

// ─── Welcome banner ───────────────────────────────────────────
function printWelcome() {
  console.clear();
  console.log();
  console.log("  ╔═══════════════════════════════════════════════════════════╗");
  console.log("  ║                                                           ║");
  console.log("  ║         💇‍♀️  STUDIO SHIRA  ·  סטודיו שירה  💇‍♀️           ║");
  console.log("  ║              Dizengoff Street, Tel Aviv                   ║");
  console.log("  ║                                                           ║");
  console.log("  ╠═══════════════════════════════════════════════════════════╣");
  console.log("  ║                                                           ║");
  console.log("  ║  📅 book          Book a new appointment                  ║");
  console.log("  ║  ❌ cancel        Cancel an existing booking              ║");
  console.log("  ║  📋 show schedule View today's schedule (Shira only)      ║");
  console.log("  ║  💬 anything else Chat with our AI assistant              ║");
  console.log("  ║  🚪 exit / quit   Close the system                        ║");
  console.log("  ║                                                           ║");
  console.log("  ╠═══════════════════════════════════════════════════════════╣");
  console.log("  ║  שלום! We speak both Hebrew & English 🇮🇱                  ║");
  console.log("  ╚═══════════════════════════════════════════════════════════╝");
  console.log();
}

// ─── Main loop ────────────────────────────────────────────────
async function main() {
  if (!process.env.GROQ_API_KEY) {
    console.error("❌ Missing GROQ_API_KEY environment variable.");
    console.error("   Run: export GROQ_API_KEY=your_key_here");
    process.exit(1);
  }

  printWelcome();

  while (true) {
    const input = (await ask("  You / אתה: ")).trim();
    if (!input) continue;

    const lower = input.toLowerCase();

    if (lower === "exit" || lower === "quit" || lower === "יציאה") {
      console.log("\n  👋 Shalom! See you soon at Studio Shira! שלום! 💙\n");
      rl.close();
      process.exit(0);
    } else if (lower === "book" || lower === "הזמן" || lower === "תור") {
      await bookingFlow();
    } else if (lower === "cancel" || lower === "ביטול") {
      await cancellationFlow();
    } else if (lower === "show schedule" || lower === "schedule" || lower === "לוח זמנים") {
      showSchedule();
    } else {
      await chatWithAI(input);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
