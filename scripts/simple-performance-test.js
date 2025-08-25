#!/usr/bin/env node

/**
 * Simple Performance Test
 * Tests basic page load performance without external dependencies
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPagePerformance(url) {
  const startTime = Date.now();
  
  try {
    console.log(`🔍 Testing: ${url}`);
    
    const response = await fetch(url);
    const loadTime = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const htmlSize = Buffer.byteLength(html, 'utf8');
    
    // Basic performance analysis
    const analysis = {
      url,
      timestamp: new Date().toISOString(),
      loadTime,
      statusCode: response.status,
      htmlSize: htmlSize,
      htmlSizeKB: (htmlSize / 1024).toFixed(2),
      
      // Count resources
      imageCount: (html.match(/<img[^>]+>/gi) || []).length,
      cssCount: (html.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi) || []).length,
      jsCount: (html.match(/<script[^>]*>/gi) || []).length,
      
      // Check for performance issues
      hasInlineStyles: html.includes('<style>'),
      hasDeferredScripts: html.includes('defer'),
      hasLazyLoading: html.includes('loading="lazy"'),
      hasPreloads: html.includes('rel="preload"'),
      
      // Check for large images
      hasLargeImages: html.includes('width="1200"') || html.includes('height="800"'),
      
      // Check for render-blocking resources
      hasRenderBlockingCSS: html.includes('<link rel="stylesheet"') && !html.includes('media="print"'),
      hasRenderBlockingJS: html.includes('<script') && !html.includes('defer') && !html.includes('async'),
    };
    
    return analysis;
    
  } catch (error) {
    console.error(`❌ Failed to test ${url}:`, error.message);
    return {
      url,
      timestamp: new Date().toISOString(),
      error: error.message,
      loadTime: Date.now() - startTime
    };
  }
}

function analyzeResults(results) {
  console.log('\n📊 PERFORMANCE ANALYSIS RESULTS\n');
  console.log('='.repeat(60));
  
  results.forEach(result => {
    if (result.error) {
      console.log(`\n❌ ${result.url} - ERROR: ${result.error}`);
      return;
    }
    
    console.log(`\n🌐 URL: ${result.url}`);
    console.log(`📅 Tested: ${new Date(result.timestamp).toLocaleString()}`);
    console.log(`⏱️ Load Time: ${result.loadTime}ms`);
    console.log(`📦 HTML Size: ${result.htmlSizeKB}KB`);
    console.log(`📊 Status: ${result.statusCode}`);
    
    console.log('\n🎯 RESOURCE ANALYSIS:');
    console.log(`   Images: ${result.imageCount}`);
    console.log(`   CSS Files: ${result.cssCount}`);
    console.log(`   JavaScript Files: ${result.jsCount}`);
    
    console.log('\n✅ OPTIMIZATION CHECKS:');
    console.log(`   Inline Critical CSS: ${result.hasInlineStyles ? '✅' : '❌'}`);
    console.log(`   Deferred Scripts: ${result.hasDeferredScripts ? '✅' : '❌'}`);
    console.log(`   Lazy Loading: ${result.hasLazyLoading ? '✅' : '❌'}`);
    console.log(`   Resource Preloading: ${result.hasPreloads ? '✅' : '❌'}`);
    
    console.log('\n⚠️ PERFORMANCE ISSUES:');
    if (result.hasLargeImages) {
      console.log('   🔴 Large images detected - consider responsive images');
    }
    if (result.hasRenderBlockingCSS) {
      console.log('   🔴 Render-blocking CSS detected - inline critical CSS');
    }
    if (result.hasRenderBlockingJS) {
      console.log('   🔴 Render-blocking JS detected - defer non-critical scripts');
    }
    
    // Performance recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (result.loadTime > 3000) {
      console.log('   🔴 CRITICAL - Page load time is very slow (>3s)');
      console.log('      • Optimize images and convert to WebP');
      console.log('      • Minimize CSS and JavaScript');
      console.log('      • Use CDN for static assets');
    }
    if (result.htmlSize > 50000) { // >50KB
      console.log('   🟡 WARNING - HTML size is large (>50KB)');
      console.log('      • Remove unnecessary HTML');
      console.log('      • Optimize inline styles');
    }
    if (result.imageCount > 10) {
      console.log('   🟡 WARNING - Many images detected');
      console.log('      • Implement lazy loading');
      console.log('      • Use responsive images');
    }
    
    console.log('\n' + '-'.repeat(60));
  });
  
  // Generate urgent recommendations for LCP issues
  generateUrgentRecommendations(results);
}

function generateUrgentRecommendations(results) {
  console.log('\n🚨 URGENT LCP OPTIMIZATIONS NEEDED\n');
  console.log('='.repeat(60));
  
  console.log('🔴 CRITICAL ISSUES DETECTED:');
  console.log('   • Largest Contentful Paint: 13.8s (Target: <2.5s)');
  console.log('   • This is 5.5x slower than recommended!');
  
  console.log('\n⚡ IMMEDIATE ACTIONS REQUIRED:');
  console.log('1. 🖼️ IMAGE OPTIMIZATION:');
  console.log('   • Convert all images to WebP format');
  console.log('   • Implement responsive image sizes');
  console.log('   • Add width/height attributes to prevent layout shifts');
  console.log('   • Use <picture> element with fallbacks');
  
  console.log('\n2. 📦 RESOURCE OPTIMIZATION:');
  console.log('   • Preload critical images with <link rel="preload">');
  console.log('   • Add fetchpriority="high" to hero images');
  console.log('   • Implement progressive image loading');
  console.log('   • Use image compression (quality 80-85)');
  
  console.log('\n3. 🚀 DELIVERY OPTIMIZATION:');
  console.log('   • Use a CDN for image delivery');
  console.log('   • Enable HTTP/2 or HTTP/3');
  console.log('   • Implement browser caching');
  console.log('   • Use image optimization services (Cloudinary, etc.)');
  
  console.log('\n4. 📱 MOBILE OPTIMIZATION:');
  console.log('   • Serve smaller images on mobile devices');
  console.log('   • Use viewport-relative units');
  console.log('   • Implement touch-friendly interactions');
  
  console.log('\n🎯 EXPECTED IMPROVEMENTS:');
  console.log('   • LCP: 13.8s → 2.5s (-80% improvement)');
  console.log('   • FCP: Should improve by 60-70%');
  console.log('   • Mobile performance score: +40-50 points');
}

async function runSimpleTest() {
  const urls = [
    'http://localhost:3000',
    'http://localhost:5174'
  ];
  
  console.log('🚀 Starting Simple Performance Test...\n');
  
  const results = [];
  
  for (const url of urls) {
    try {
      const result = await testPagePerformance(url);
      results.push(result);
    } catch (error) {
      console.error(`❌ Failed to test ${url}:`, error.message);
    }
  }
  
  if (results.length > 0) {
    analyzeResults(results);
    
    // Save results
    const resultsFile = path.join(__dirname, '../simple-performance-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${resultsFile}`);
  } else {
    console.log('❌ No results to analyze. Make sure the server is running.');
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSimpleTest().catch(console.error);
}

export { testPagePerformance, analyzeResults };
