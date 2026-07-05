import { logger } from "../middleware/logger.js";
import { eq, desc } from "drizzle-orm";
import { issues } from "@paperclipai/db";

export function startTelegramBotService(db: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const allowedChatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !allowedChatId) {
    logger.warn("Telegram bot skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing.");
    return;
  }

  logger.info({ allowedChatId }, "Starting Telegram Command Center service...");

  let lastUpdateId = 0;
  let isPolling = false;

  async function sendMessage(text: string) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: allowedChatId,
          text,
          parse_mode: "Markdown"
        })
      });
      if (!res.ok) {
        logger.error({ status: res.status, text: await res.text() }, "Failed to send Telegram message");
      }
    } catch (err) {
      logger.error({ err }, "Error sending Telegram message");
    }
  }

  async function handleCommand(command: string, args: string[]) {
    switch (command) {
      case "/ping":
        await sendMessage("🏓 **Pong!** Hệ thống Paperclip vẫn đang chạy tốt!");
        break;
      
      case "/status":
        await sendMessage("🟢 **Trạng thái:**\nServer Paperclip API đang hoạt động bình thường.\nWebsocket Liveness: OK");
        break;

      case "/report":
        try {
          // Fetch some running or backlog issues
          const recentIssues = await db
            .select()
            .from(issues)
            .orderBy(desc(issues.createdAt))
            .limit(5);

          if (recentIssues.length === 0) {
            await sendMessage("📊 **Report:** Không có task (issue) nào trong hệ thống.");
            return;
          }

          let report = "📊 **Recent Issues Report:**\n";
          for (const issue of recentIssues) {
            report += `- \`[${issue.id.slice(0,6)}]\` ${issue.title} (Status: *${issue.status}*)\n`;
          }
          await sendMessage(report);
        } catch (err) {
          logger.error({ err }, "Error fetching report");
          await sendMessage("❌ Lỗi khi lấy report từ database.");
        }
        break;

      case "/approve":
        const issueId = args[0];
        if (!issueId) {
          await sendMessage("⚠️ **Cú pháp:** `/approve [issue_id]`");
          return;
        }
        try {
          const targetIssue = await db.select().from(issues).where(eq(issues.id, issueId)).limit(1).then((r: any) => r[0]);
          if (!targetIssue) {
            await sendMessage(`❌ Không tìm thấy Issue ID: \`${issueId}\``);
            return;
          }
          await db.update(issues).set({ status: "in_progress" }).where(eq(issues.id, issueId));
          await sendMessage(`✅ **Đã duyệt!** Issue \`${issueId}\` đã được chuyển trạng thái tiếp tục.`);
        } catch (err) {
          logger.error({ err }, "Error approving issue");
          await sendMessage("❌ Lỗi khi duyệt issue.");
        }
        break;

      default:
        await sendMessage("⚠️ **Lệnh không hợp lệ.** Các lệnh hỗ trợ: `/ping`, `/status`, `/report`, `/approve`");
        break;
    }
  }

  async function poll() {
    if (isPolling) return;
    isPolling = true;

    try {
      const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json() as any;
        if (data.ok && data.result) {
          for (const update of data.result) {
            lastUpdateId = update.update_id;
            const message = update.message;
            if (message && message.text) {
              const chatId = String(message.chat.id);
              if (chatId === allowedChatId) {
                const text = message.text.trim();
                if (text.startsWith("/")) {
                  const parts = text.split(" ");
                  const command = parts[0].split("@")[0]; // remove @botname if exists
                  const args = parts.slice(1);
                  logger.info({ command, args }, "Received Telegram command");
                  await handleCommand(command, args);
                }
              } else {
                logger.warn({ chatId, allowedChatId }, "Ignored message from unauthorized chat ID");
              }
            }
          }
        }
      }
    } catch (err) {
      // Ignore network errors in polling to avoid log spam, or log debug
      // logger.debug({ err }, "Telegram polling timeout/error");
    } finally {
      isPolling = false;
      setTimeout(poll, 1000);
    }
  }

  // Khởi động vòng lặp poll ngay lập tức
  void poll();
}
