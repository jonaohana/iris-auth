const fs = require('fs');
const path = require('path');

const envDir = path.join(__dirname, '..', 'env');
const exampleEnvPath = path.join(envDir, '.env.example');
const envPath = path.join(envDir, '.env');

// Create env directory if it doesn't exist
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(exampleEnvPath)) {
    fs.copyFileSync(exampleEnvPath, envPath);
    console.log('✅ Created .env file from .env.example in env folder');
  } else {
    fs.writeFileSync(envPath, '# Firebase Auth UI Environment Variables\n');
    console.log('✅ Created empty .env file in env folder');
  }
} else {
  console.log('ℹ️  .env file already exists in env folder');
}
