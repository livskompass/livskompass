#!/bin/bash
# Upload all media from local R2 to remote R2
# The migration script uploaded to local R2 by default; this fixes that.

cd "$(dirname "$0")/../api"

echo "Fetching media keys from remote D1..."
KEYS=$(npx wrangler d1 execute livskompass-db --remote --command="SELECT r2_key FROM media" --json 2>/dev/null | node -e "
  const data = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  data[0].results.forEach(r => console.log(r.r2_key));
")

TOTAL=$(echo "$KEYS" | wc -l | tr -d ' ')
echo "Found $TOTAL media files to upload"

COUNT=0
FAIL=0

for KEY in $KEYS; do
  COUNT=$((COUNT + 1))
  echo -n "[$COUNT/$TOTAL] $KEY ... "

  TMPFILE="/tmp/r2-upload-$$"

  # Get from local R2
  if npx wrangler r2 object get "livskompass-media/$KEY" --local --pipe > "$TMPFILE" 2>/dev/null; then
    # Upload to remote R2
    CT=$(file --mime-type -b "$TMPFILE")
    if npx wrangler r2 object put "livskompass-media/$KEY" --remote --file="$TMPFILE" --content-type="$CT" 2>/dev/null; then
      echo "OK"
    else
      echo "UPLOAD FAILED"
      FAIL=$((FAIL + 1))
    fi
  else
    echo "LOCAL GET FAILED"
    FAIL=$((FAIL + 1))
  fi

  rm -f "$TMPFILE"
done

echo ""
echo "Done: $((COUNT - FAIL))/$COUNT succeeded, $FAIL failed"
