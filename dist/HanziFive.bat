@echo off
echo Starting HanziFive Chinese Flashcards...
cd %~dp0
start "" http://localhost:3000
node .next/standalone/server.js
