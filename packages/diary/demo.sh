#!/usr/bin/env bash
set -exo pipefail

echo "$USER - $GH_TOKEN"
node \
  -r ts-node/register \
  ./src/bin.ts \
  -o ./diary.json \
  --login "$USER" \
  --token "$GH_TOKEN"
