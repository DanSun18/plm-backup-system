#!/bin/bash
npm install
echo "Starting server..." && \
nohup npm run start-dev >/dev/null 2>&1 & 

