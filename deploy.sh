#!/usr/bin/env bash
set -euox pipefail
cd packages/ui

REMOTE_BLOG_DIRNAME="/www/static/github-diary"
npm run build
rsync -r --verbose public/ $SSH_USER@$DROPLET_IP:"$REMOTE_BLOG_DIRNAME"
rsync -r --verbose out/ $SSH_USER@$DROPLET_IP:$REMOTE_BLOG_DIRNAME
ssh $SSH_USER@$DROPLET_IP chown -R $USER:webadmins $REMOTE_BLOG_DIRNAME
ssh $SSH_USER@$DROPLET_IP chmod -R ug+rx $REMOTE_BLOG_DIRNAME
