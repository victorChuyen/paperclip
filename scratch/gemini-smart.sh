#!/bin/bash
# Smart Gemini Wrapper with Key Rotation, Downgrade, and Session Recovery
KEYS_POOL=("$GEMINI_API_KEY" "$GEMINI_API_KEY_2" "$GEMINI_API_KEY_3" "$GEMINI_API_KEY_4" "$GEMINI_API_KEY_5" "$GEMINI_API_KEY_6" "$GEMINI_API_KEY_7")

run_gemini() {
  local model_args=("$@")
  for key in "${KEYS_POOL[@]}"; do
    if [ -z "$key" ] || [ "$key" == "undefined" ]; then continue; fi
    export GOOGLE_API_KEY="$key"
    export GEMINI_API_KEY="$key"
    
    /usr/local/bin/gemini-orig "${model_args[@]}"
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 42 ]; then # Session error
      echo "[SMART] Session error. Retrying without resume..." >&2
      NEW_ARGS=()
      SKIP_NEXT=false
      for arg in "${model_args[@]}"; do
        if [ "$SKIP_NEXT" = true ]; then SKIP_NEXT=false; continue; fi
        if [ "$arg" = "--resume" ]; then SKIP_NEXT=true; continue; fi
        NEW_ARGS+=("$arg")
      done
      /usr/local/bin/gemini-orig "${NEW_ARGS[@]}"
      EXIT_CODE=$?
    fi

    if [ $EXIT_CODE -eq 0 ]; then
      return 0
    fi
    echo "[SMART] Key failed (Exit: $EXIT_CODE). Rotating..." >&2
  done
  return 1
}

# Try with original args
run_gemini "$@"
RESULT=$?
if [ $RESULT -eq 0 ]; then exit 0; fi

# If failed and was using 2.0-flash, try downgrading to 1.5-flash
if [[ "$*" == *"gemini-2.0-flash"* ]]; then
  echo "[SMART] 2.0-flash exhausted. Downgrading to 1.5-flash..." >&2
  DOWNGRADE_ARGS=()
  for arg in "$@"; do
    if [ "$arg" == "gemini-2.0-flash" ]; then
      DOWNGRADE_ARGS+=("gemini-1.5-flash")
    else
      DOWNGRADE_ARGS+=("$arg")
    fi
  done
  run_gemini "${DOWNGRADE_ARGS[@]}"
  exit $?
fi

exit $RESULT
