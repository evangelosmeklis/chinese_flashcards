const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

// We'll need to install fs-extra and archiver first
try {
  require.resolve('fs-extra');
  require.resolve('archiver');
} catch (e) {
  console.error('Missing required packages. Please run:');
  console.error('npm install fs-extra archiver --save-dev');
  process.exit(1);
}

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const nextDir = path.join(rootDir, '.next');
const packageName = 'HanziFive-v1.0.0';
const zipFilePath = path.join(rootDir, `${packageName}.zip`);

async function packageDist() {
  console.log('Packaging distribution...');
  
  // Ensure .next/standalone was created
  if (!fs.existsSync(path.join(nextDir, 'standalone'))) {
    console.error('Standalone build not found. Please run "npm run build" first');
    process.exit(1);
  }
  
  try {
    // Prepare dist directory
    await fs.ensureDir(distDir);

    // Copy standalone Next.js build
    console.log('Copying Next.js standalone build...');
    await fs.copy(
      path.join(nextDir, 'standalone'),
      path.join(distDir, '.next', 'standalone')
    );

    // Copy static files
    console.log('Copying static assets...');
    await fs.copy(
      path.join(nextDir, 'static'),
      path.join(distDir, '.next', 'static')
    );

    // Create ZIP file
    console.log(`Creating ${packageName}.zip...`);
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
      console.log(`Successfully created package: ${zipFilePath}`);
      console.log(`Total size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
    });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    archive.pipe(output);
    archive.directory(distDir, packageName);
    await archive.finalize();
    
  } catch (err) {
    console.error('Error packaging distribution:', err);
    process.exit(1);
  }
}

packageDist(); 