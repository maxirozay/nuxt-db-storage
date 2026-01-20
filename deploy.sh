#!/bin/sh

NAME="test"
SERVER_URL="debian@dev.visioncompliance.ch"
SSH_KEY="~/.ssh/$NAME"
REMOTE_PATH="~/$NAME"

docker build --platform linux/amd64 -t $NAME .
docker save $NAME > $NAME.tar

scp -i $SSH_KEY $NAME.tar $SERVER_URL:$REMOTE_PATH
scp -i $SSH_KEY compose.yaml $SERVER_URL:$REMOTE_PATH
ssh -i $SSH_KEY $SERVER_URL "
  cd $REMOTE_PATH && \
  sudo docker load < $NAME.tar && \
  sudo docker compose up -d --force-recreate
  sudo docker image prune -a -f
"
rm $NAME.tar