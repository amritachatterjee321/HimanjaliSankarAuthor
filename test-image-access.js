const https = require('https');
const http = require('http');

// Test image accessibility
function testImageAccess(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https:') ? https : http;
        
        protocol.get(url, (res) => {
            console.log(`Image Status: ${res.statusCode}`);
            console.log(`Content-Type: ${res.headers['content-type']}`);
            console.log(`Content-Length: ${res.headers['content-length']}`);
            
            if (res.statusCode === 200) {
                resolve(true);
            } else {
                reject(new Error(`Image not accessible: ${res.statusCode}`));
            }
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Test meta tag extraction
function testMetaTags(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https:') ? https : http;
        
        protocol.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                // Extract meta tags
                const ogImageMatch = data.match(/<meta property="og:image" content="([^"]+)"/);
                const twitterImageMatch = data.match(/<meta name="twitter:image" content="([^"]+)"/);
                const ogImageWidthMatch = data.match(/<meta property="og:image:width" content="([^"]+)"/);
                const ogImageHeightMatch = data.match(/<meta property="og:image:height" content="([^"]+)"/);
                
                console.log('\nMeta Tag Analysis:');
                console.log(`OG Image: ${ogImageMatch ? ogImageMatch[1] : 'Not found'}`);
                console.log(`Twitter Image: ${twitterImageMatch ? twitterImageMatch[1] : 'Not found'}`);
                console.log(`OG Image Width: ${ogImageWidthMatch ? ogImageWidthMatch[1] : 'Not found'}`);
                console.log(`OG Image Height: ${ogImageHeightMatch ? ogImageHeightMatch[1] : 'Not found'}`);
                
                resolve({
                    ogImage: ogImageMatch ? ogImageMatch[1] : null,
                    twitterImage: twitterImageMatch ? twitterImageMatch[1] : null,
                    hasDimensions: !!(ogImageWidthMatch && ogImageHeightMatch)
                });
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Run tests
async function runTests() {
    const baseUrl = 'https://himanjalisankar.com';
    
    try {
        console.log('Testing image accessibility...');
        await testImageAccess(`${baseUrl}/himanjalisankar.png`);
        
        console.log('\nTesting meta tags on homepage...');
        await testMetaTags(baseUrl);
        
        console.log('\nTesting meta tags on about page...');
        await testMetaTags(`${baseUrl}/about`);
        
        console.log('\n✅ All tests completed successfully!');
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    }
}

runTests();
