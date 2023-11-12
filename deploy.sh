#!/bin/bash

# production server (SSH public key authentication)
SERVER=34.130.0.51
REMOTE_DIR=~/project-grimoire

# building the frontend image (--squash is experimental and optional)
docker build -t frontend -f frontend.dockerfile .
# uploading the frontend image on production server
docker save frontend | bzip2 | pv | ssh $SERVER "mkdir -p $REMOTE_DIR && cd $REMOTE_DIR && docker load"

# building the backend image (--squash is experimental and optional)
docker build -t backend -f backend.dockerfile .
# uploading the backend image on production server
docker save backend | bzip2 | pv | ssh $SERVER "mkdir -p $REMOTE_DIR && cd $REMOTE_DIR && docker load"

# stop all containers on the production server
ssh $SERVER "cd $REMOTE_DIR && docker compose down --remove-orphans"

# remove dangling images on the production server
ssh $SERVER "cd $REMOTE_DIR && docker rmi \$(docker images --filter 'dangling=true' -q --no-trunc)"

# copy docker-compose and .env to the production server
scp docker-compose.yml $SERVER:$REMOTE_DIR/.
scp .env $SERVER:$REMOTE_DIR/.

# restart all containers on the production server
ssh $SERVER "cd $REMOTE_DIR && docker compose up -d"
