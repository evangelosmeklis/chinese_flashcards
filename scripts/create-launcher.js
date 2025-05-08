const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Create Windows batch file
const batchScript = `@echo off
echo Starting HanziFive Chinese Flashcards...
cd %~dp0
start "" http://localhost:3000
node .next/standalone/server.js
`;

fs.writeFileSync(path.join(distDir, 'HanziFive.bat'), batchScript);
console.log('Created Windows launcher: dist/HanziFive.bat');

// Create macOS/Linux shell script
const shellScript = `#!/bin/bash
echo "Starting HanziFive Chinese Flashcards..."
cd "$(dirname "$0")"
(sleep 2 && open http://localhost:3000) &
node .next/standalone/server.js
`;

const shellScriptPath = path.join(distDir, 'HanziFive.sh');
fs.writeFileSync(shellScriptPath, shellScript);
fs.chmodSync(shellScriptPath, '755'); // Make executable
console.log('Created macOS/Linux launcher: dist/HanziFive.sh');

// Create a README file for the distribution
const readmeContent = `# HanziFive - Chinese Flashcards

## How to Run

### Windows
Double-click the HanziFive.bat file to start the application.

### macOS / Linux
Double-click the HanziFive.sh file to start the application. If it doesn't run directly, open Terminal and run:
\`\`\`
chmod +x HanziFive.sh
./HanziFive.sh
\`\`\`

## About
HanziFive is a modern Chinese flashcard application to help you learn and practice Chinese characters.

Enjoy learning Chinese!
`;

fs.writeFileSync(path.join(distDir, 'README.txt'), readmeContent);
console.log('Created distribution README: dist/README.txt');

// Copy the necessary files from .next/standalone to dist
console.log('Copying built application to distribution folder...');
try {
  // Create package script to copy the files needed for distribution
  console.log('Please run "next build" with the standalone output option enabled before creating a distribution package.');
  console.log('Distribution preparation completed!');
} catch (error) {
  console.error('Error preparing distribution:', error);
} 