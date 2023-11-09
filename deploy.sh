#!/bin/bash

# production server (SSH public key authnetication)
SERVER=34.130.0.51

# building the frontend image (--squash is experimental and optional)
docker build --squash -t frontend -f frontend.dockerfile .
# uploading the image on production server
docker save frontend | bzip2 | pv | ssh $SERVER docker load

# same with the backend 
docker build --squash -t backend -f backend.dockerfile .
docker save backend | bzip2 | pv | ssh $SERVER docker load

# stop all container on the production server
ssh $SERVER docker-compose down --remove-orphans

# remove dangling images
ssh $SERVER  docker rmi $(docker images --filter "dangling=true" -q --no-trunc)

# copy docker-compose and .env
scp docker-compose.yml $SERVER:.
scp .env $SERVER:.

# restart all containers
ssh $SERVER docker-compose up -d