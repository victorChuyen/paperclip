#!/bin/bash
# Smart Codex Wrapper for DeepSeek
if [ -n "$DEEPSEEK_API_KEY" ]; then
  export OPENAI_API_KEY="$DEEPSEEK_API_KEY"
  /usr/local/bin/codex-orig -c api.base_url="https://api.deepseek.com" -c model="deepseek-chat" "$@"
else
  /usr/local/bin/codex-orig "$@"
fi
