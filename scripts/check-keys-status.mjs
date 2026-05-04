import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "node:path";

dotenv.config();

async function checkStatus(name, url, headers = {}, method = "GET") {
  try {
    const res = await fetch(url, { method, headers });
    if (res.ok) {
      console.log(`✅ ${name}: LIVE`);
    } else {
      const text = await res.text();
      console.log(`❌ ${name}: FAILED (${res.status})`);
    }
  } catch (err) {
    console.log(`❌ ${name}: ERROR (${err.message})`);
  }
}

async function main() {
  console.log("--- Paperclip API Health Audit ---");
  
  if (process.env.GEMINI_API_KEY) {
    await checkStatus("Gemini", `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
  }
  
  if (process.env.DEEPSEEK_API_KEY) {
    await checkStatus("DeepSeek", "https://api.deepseek.com/models", { "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}` });
  }

  if (process.env.GROQ_API_KEY) {
    await checkStatus("Groq", "https://api.groq.com/openai/v1/models", { "Authorization": `Bearer ${process.env.GROQ_API_KEY}` });
  }

  if (process.env.MISTRAL_API_KEY) {
    await checkStatus("Mistral", "https://api.mistral.ai/v1/models", { "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}` });
  }

  if (process.env.TOGETHER_API_KEY) {
    await checkStatus("Together AI", "https://api.together.xyz/v1/models", { "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}` });
  }
}

main();
