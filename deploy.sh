#!/usr/bin/env bash
set -euox pipefail
cd packages/ui

REMOTE_BLOG_DIRNAME="/www/static/github-diary"
npm run build
rsync -r --verbose public/ $USER@$DROPLET_IP:"$REMOTE_BLOG_DIRNAME"
rsync -r --verbose out/ $USER@$DROPLET_IP:$REMOTE_BLOG_DIRNAME
# !!!! RUN deploy.sh from provision repo as well to _dial in some req'd_ effects
