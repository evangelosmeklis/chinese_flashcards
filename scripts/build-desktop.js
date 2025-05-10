const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure the dist directory exists
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Build the app
console.log('Building the app...');
execSync('npm run electron-build', { stdio: 'inherit' });

console.log('Build completed! The packaged app can be found in the dist directory.'); 