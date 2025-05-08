#!/bin/bash
echo "Starting HanziFive Chinese Flashcards..."
cd "$(dirname "$0")"
(sleep 2 && open http://localhost:3000) &
node .next/standalone/server.js
