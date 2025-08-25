#!/usr/bin/env node

/**
 * Performance Benchmark Script
 * Tests and measures Core Web Vitals improvements
 */

import puppeteer from 'puppeteer'; // Install with: npm install puppeteer
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function measurePagePerformance(url) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
    const page = await browser.newPage();
    
    // Set viewport to simulate mobile device
    await page.setViewport({ width: 375, height: 667 });
    
    // Enable performance monitoring
    await page.setCacheEnabled(false);
    
    console.log(`🔍 Testing: ${url}`);
    
    // Navigate and wait for page load
    const startTime = Date.now();
    await page.goto(url, { waitUntil: 'networkidle0' });
    const loadTime = Date.now() - startTime;
    
    // Measure Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {};
          
          entries.forEach(entry => {
            if (entry.entryType === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime;
            }
            if (entry.entryType === 'first-input') {
              vitals.fid = entry.processingStart - entry.startTime;
            }
            if (entry.entryType === 'layout-shift') {
              vitals.cls = (vitals.cls || 0) + entry.value;
            }
          });
          
          // Get First Contentful Paint
          const fcpEntry = performance.getEntriesByType('paint')
            .find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            vitals.fcp = fcpEntry.startTime;
          }
          
          // Get Navigation Timing
          const navTiming = performance.getEntriesByType('navigation')[0];
          if (navTiming) {
            vitals.domContentLoaded = navTiming.domContentLoadedEventEnd - navTiming.navigationStart;
            vitals.domComplete = navTiming.domComplete - navTiming.navigationStart;
          }
          
          resolve(vitals);
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
        
        // Fallback timeout
        setTimeout(() => {
          const fcpEntry = performance.getEntriesByType('paint')
            .find(entry => entry.name === 'first-contentful-paint');
          const navTiming = performance.getEntriesByType('navigation')[0];
          
          resolve({
            fcp: fcpEntry ? fcpEntry.startTime : null,
            domContentLoaded: navTiming ? navTiming.domContentLoadedEventEnd - navTiming.navigationStart : null,
            domComplete: navTiming ? navTiming.domComplete - navTiming.navigationStart : null
          });
        }, 5000);
      });
    });
    
    // Measure resource loading
    const resourceMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      
      const imageResources = resources.filter(r => r.initiatorType === 'img');
      const cssResources = resources.filter(r => r.initiatorType === 'link');
      const jsResources = resources.filter(r => r.initiatorType === 'script');

    return {
        totalResources: resources.length,
        images: {
          count: imageResources.length,
          totalSize: imageResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
          avgLoadTime: imageResources.length > 0 ? 
            imageResources.reduce((sum, r) => sum + r.duration, 0) / imageResources.length : 0
        },
        css: {
          count: cssResources.length,
          totalSize: cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
          avgLoadTime: cssResources.length > 0 ? 
            cssResources.reduce((sum, r) => sum + r.duration, 0) / cssResources.length : 0
        },
        js: {
          count: jsResources.length,
          totalSize: jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
          avgLoadTime: jsResources.length > 0 ? 
            jsResources.reduce((sum, r) => sum + r.duration, 0) / jsResources.length : 0
        }
      };
    });
    
    return {
      url,
      timestamp: new Date().toISOString(),
      pageLoadTime: loadTime,
      ...metrics,
      resources: resourceMetrics
    };
    
  } finally {
    await browser.close();
  }
}

function analyzeResults(results) {
  console.log('\n📊 PERFORMANCE ANALYSIS RESULTS\n');
  console.log('='.repeat(50));
  
  results.forEach(result => {
    console.log(`\n🌐 URL: ${result.url}`);
    console.log(`📅 Tested: ${new Date(result.timestamp).toLocaleString()}`);
    console.log('\n🎯 CORE WEB VITALS:');
    
    if (result.fcp) {
      const fcpSeconds = (result.fcp / 1000).toFixed(2);
      const fcpStatus = result.fcp <= 1800 ? '✅ GOOD' : result.fcp <= 3000 ? '⚠️ NEEDS IMPROVEMENT' : '❌ POOR';
      console.log(`   First Contentful Paint: ${fcpSeconds}s ${fcpStatus}`);
    }
    
    if (result.lcp) {
      const lcpSeconds = (result.lcp / 1000).toFixed(2);
      const lcpStatus = result.lcp <= 2500 ? '✅ GOOD' : result.lcp <= 4000 ? '⚠️ NEEDS IMPROVEMENT' : '❌ POOR';
      console.log(`   Largest Contentful Paint: ${lcpSeconds}s ${lcpStatus}`);
    }
    
    if (result.fid) {
      const fidMs = result.fid.toFixed(0);
      const fidStatus = result.fid <= 100 ? '✅ GOOD' : result.fid <= 300 ? '⚠️ NEEDS IMPROVEMENT' : '❌ POOR';
      console.log(`   First Input Delay: ${fidMs}ms ${fidStatus}`);
    }
    
    if (result.cls !== undefined) {
      const clsValue = result.cls.toFixed(3);
      const clsStatus = result.cls <= 0.1 ? '✅ GOOD' : result.cls <= 0.25 ? '⚠️ NEEDS IMPROVEMENT' : '❌ POOR';
      console.log(`   Cumulative Layout Shift: ${clsValue} ${clsStatus}`);
    }
    
    console.log('\n⏱️ TIMING METRICS:');
    if (result.domContentLoaded) {
      console.log(`   DOM Content Loaded: ${(result.domContentLoaded / 1000).toFixed(2)}s`);
    }
    if (result.domComplete) {
      console.log(`   DOM Complete: ${(result.domComplete / 1000).toFixed(2)}s`);
    }
    console.log(`   Total Page Load: ${(result.pageLoadTime / 1000).toFixed(2)}s`);
    
    console.log('\n📦 RESOURCE ANALYSIS:');
    console.log(`   Total Resources: ${result.resources.totalResources}`);
    console.log(`   Images: ${result.resources.images.count} (${(result.resources.images.totalSize / 1024).toFixed(0)}KB)`);
    console.log(`   CSS Files: ${result.resources.css.count} (${(result.resources.css.totalSize / 1024).toFixed(0)}KB)`);
    console.log(`   JavaScript Files: ${result.resources.js.count} (${(result.resources.js.totalSize / 1024).toFixed(0)}KB)`);
    
    console.log('\n' + '-'.repeat(50));
  });
  
  // Generate recommendations
  generateRecommendations(results);
}

function generateRecommendations(results) {
  console.log('\n💡 PERFORMANCE RECOMMENDATIONS\n');
  console.log('='.repeat(50));
  
  const result = results[0]; // Analyze first result
  
  if (result.fcp > 1800) {
    console.log('🔴 CRITICAL - First Contentful Paint is slow:');
    console.log('   • Inline critical CSS for above-the-fold content');
    console.log('   • Preload critical fonts and resources');
    console.log('   • Optimize image loading and compression');
    console.log('   • Defer non-critical JavaScript');
  }
  
  if (result.lcp > 2500) {
    console.log('🔴 CRITICAL - Largest Contentful Paint is slow:');
    console.log('   • Optimize hero images with WebP format');
    console.log('   • Implement lazy loading for below-fold images');
    console.log('   • Use responsive images with proper sizing');
    console.log('   • Consider using a CDN for faster delivery');
  }
  
  if (result.resources.images.totalSize > 1024 * 1024) { // > 1MB
    console.log('🟡 WARNING - Image payload is large:');
    console.log('   • Compress images with WebP format');
    console.log('   • Implement responsive image sizes');
    console.log('   • Use lazy loading for non-critical images');
  }
  
  if (result.resources.totalResources > 50) {
    console.log('🟡 WARNING - Too many HTTP requests:');
    console.log('   • Bundle and minify CSS/JS files');
    console.log('   • Use sprite sheets for small images');
    console.log('   • Implement resource bundling');
  }
  
  console.log('\n✅ IMPLEMENTED OPTIMIZATIONS:');
  console.log('   • Critical CSS inlined');
  console.log('   • Font loading optimized with display=swap');
  console.log('   • Native lazy loading for images');
  console.log('   • Non-critical JavaScript deferred');
  console.log('   • Resource preloading for critical assets');
  console.log('   • Render-blocking resources removed/deferred');
  
  console.log('\n🎯 TARGET GOALS:');
  console.log('   • First Contentful Paint: < 1.8s');
  console.log('   • Largest Contentful Paint: < 2.5s');
  console.log('   • First Input Delay: < 100ms');
  console.log('   • Cumulative Layout Shift: < 0.1');
}

async function runBenchmark() {
  const urls = [
    'http://localhost:3000', // Local development server
    'http://localhost:5174'  // Vite dev server
  ];
  
  console.log('🚀 Starting Performance Benchmark...\n');
  
  const results = [];
  
  for (const url of urls) {
    try {
      console.log(`Testing ${url}...`);
      const result = await measurePagePerformance(url);
      results.push(result);
    } catch (error) {
      console.error(`❌ Failed to test ${url}:`, error.message);
    }
  }
  
  if (results.length > 0) {
    analyzeResults(results);
    
    // Save results to file
    const resultsFile = path.join(__dirname, '../performance-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${resultsFile}`);
  } else {
    console.log('❌ No results to analyze. Make sure the server is running.');
  }
}

// Run benchmark if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runBenchmark().catch(console.error);
}

export { measurePagePerformance, analyzeResults };