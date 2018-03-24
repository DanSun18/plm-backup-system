#!/bin/bash
npm install
echo "Starting server..." && \
nohup npm run start-https >/dev/null 2>&1 & 

