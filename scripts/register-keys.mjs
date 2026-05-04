import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const USER_EMAIL = "trannhacattien2017@gmail.com";
const USER_PASS = "Tnc@1980";
const PROFILE_DIR = path.resolve(".tmp/browser-profile-stealth-v2");
const ENV_FILE = path.resolve(".env");

async function updateEnv(key, value) {
  let content = "";
  try { content = await fs.readFile(ENV_FILE, "utf8"); } catch { content = ""; }
  const lines = content.split("\n");
  const newLines = [];
  let found = false;
  for (let line of lines) {
    if (line.startsWith(`${key}=`)) {
      newLines.push(`${key}=${value}`);
      found = true;
    } else {
      newLines.push(line);
    }
  }
  if (!found) newLines.push(`${key}=${value}`);
  await fs.writeFile(ENV_FILE, newLines.join("\n"), "utf8");
  console.log(`[paperclip] Updated ${key} in .env`);
}

async function handleGoogleLogin(page) {
  console.log("[paperclip] Đang kiểm tra đăng nhập Google...");
  const emailInput = page.locator("input[type='email']");
  if (await emailInput.isVisible()) {
    console.log("[paperclip] Đang nhập Email...");
    await emailInput.fill(USER_EMAIL);
    await page.click("#identifierNext");
    await page.waitForTimeout(2000);
  }

  const passInput = page.locator("input[type='password']");
  if (await passInput.isVisible()) {
    console.log("[paperclip] Đang nhập Mật khẩu...");
    await passInput.fill(USER_PASS);
    await page.click("#passwordNext");
    await page.waitForTimeout(5000);
  }

  // Check for 2FA
  if (page.url().includes("challenge")) {
    console.log("[paperclip] ⚠️ Google yêu cầu xác minh (2FA). Vui lòng nhấn xác nhận trên điện thoại của bạn!");
    await page.waitForNavigation({ timeout: 60000 }).catch(() => {});
  }
}

async function registerGemini(context) {
  const page = await context.newPage();
  await page.goto("https://aistudio.google.com/app/apikey");
  
  if (page.url().includes("accounts.google.com")) {
    await handleGoogleLogin(page);
    await page.goto("https://aistudio.google.com/app/apikey");
  }

  try {
    await page.waitForSelector("text='Get API key'", { timeout: 30000 });
    console.log("[paperclip] Đã vào Dashboard Gemini.");
    
    // Check for "Create API key in new project"
    const createBtn = page.locator("button:has-text('Create API key')").first();
    if (await createBtn.isVisible()) {
      console.log("[paperclip] Đang tạo Key mới...");
      await createBtn.click();
      await page.waitForTimeout(5000);
    }

    const keys = await page.locator("code").allInnerTexts();
    const key = keys.find(k => k.startsWith("AIzaSy"));
    if (key) {
      await updateEnv("GEMINI_API_KEY", key);
      await updateEnv("GOOGLE_API_KEY", key);
    }
  } catch (err) {
    console.log("[paperclip] Không thể tự động lấy Key Gemini. Có thể cần thao tác tay.");
  }
}

async function main() {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    args: [
      "--no-sandbox", 
      "--disable-setuid-sandbox", 
      "--disable-blink-features=AutomationControlled"
    ],
    ignoreDefaultArgs: ["--enable-automation"],
  });

  try {
    await registerGemini(context);
    // Có thể thêm Groq, NVIDIA vào đây sau khi Gemini chạy xong
  } catch (err) {
    console.error("[paperclip] Lỗi:", err);
  } finally {
    console.log("[paperclip] Xong. Đóng sau 10s...");
    await new Promise(r => setTimeout(r, 10000));
    await context.close();
  }
}

main();
