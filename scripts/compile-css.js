#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔄 Compiling SCSS to CSS...');

try {
  // Compile main.scss to main.css
  const scssPath = join(__dirname, '../public/src/styles/main.scss');
  const cssPath = join(__dirname, '../public/src/styles/main.css');
  
  execSync(`npx sass "${scssPath}" "${cssPath}" --style compressed`, { 
    stdio: 'inherit',
    cwd: join(__dirname, '..')
  });
  
  console.log('✅ CSS compilation completed successfully!');
  console.log(`📁 Output: ${cssPath}`);
  
} catch (error) {
  console.error('❌ CSS compilation failed:', error.message);
  process.exit(1);
} 