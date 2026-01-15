#!/usr/bin/env node
/**
 * Development file watcher for iris-auth
 * Watches src/ directory and triggers webpack rebuild in everglee when files change
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WATCH_DIR = path.join(__dirname, 'src');
const TRIGGER_FILE = path.join(__dirname, '../everglee/src/contexts/AuthContext.tsx');

console.log('🔍 Watching iris-auth/src for changes...');
console.log(`   Will trigger rebuild by touching: ${path.relative(process.cwd(), TRIGGER_FILE)}`);

let debounceTimer = null;

function triggerRebuild(filename) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  debounceTimer = setTimeout(() => {
    console.log(`\n📝 Change detected: ${path.relative(WATCH_DIR, filename)}`);
    console.log('🔄 Triggering webpack rebuild...');
    
    try {
      // Touch AuthContext to trigger webpack rebuild
      const now = new Date();
      fs.utimesSync(TRIGGER_FILE, now, now);
      console.log('✅ Rebuild triggered successfully\n');
    } catch (err) {
      console.error('❌ Failed to trigger rebuild:', err.message);
    }
  }, 300); // 300ms debounce
}

// Recursively watch directory
function watchRecursively(dir) {
  fs.watch(dir, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    
    const fullPath = path.join(dir, filename);
    
    // Ignore node_modules and non-TS/TSX files
    if (filename.includes('node_modules') || filename.includes('.git')) return;
    if (!filename.match(/\.(ts|tsx)$/)) return;
    
    triggerRebuild(fullPath);
  });
}

watchRecursively(WATCH_DIR);

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n👋 Stopping file watcher...');
  process.exit(0);
});
