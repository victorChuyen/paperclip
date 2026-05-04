#!/bin/bash
# Simple Telegram Message Sender
TOKEN="$TELEGRAM_BOT_TOKEN"
CHAT_ID="$TELEGRAM_CHAT_ID"
MESSAGE="$1"

if [ -z "$TOKEN" ] || [ -z "$MESSAGE" ]; then
  echo "Usage: $0 \"message\""
  exit 1
fi

# If CHAT_ID is missing, try to get the latest chat_id from updates
if [ -z "$CHAT_ID" ]; then
  CHAT_ID=$(curl -s "https://api.telegram.org/bot$TOKEN/getUpdates" | jq -r '.result[-1].message.chat.id // empty')
fi

if [ -z "$CHAT_ID" ]; then
  echo "Error: Could not determine CHAT_ID. Please send a message to the bot first."
  exit 1
fi

curl -s -X POST "https://api.telegram.org/bot$TOKEN/sendMessage" \
     -d "chat_id=$CHAT_ID" \
     -d "text=$MESSAGE" \
     -d "parse_mode=Markdown"
