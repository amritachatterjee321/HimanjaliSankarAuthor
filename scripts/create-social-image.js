// Script to create an optimized social sharing image
// This would typically use a library like sharp or canvas to create an optimized image
// For now, we'll create a simple placeholder

const fs = require('fs');
const path = require('path');

console.log('🔧 Creating optimized social sharing image...');

// Create a simple HTML file that can be used to generate an optimized image
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            margin: 0;
            padding: 0;
            width: 1200px;
            height: 630px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Arial', sans-serif;
            color: white;
        }
        .container {
            text-align: center;
            padding: 40px;
        }
        h1 {
            font-size: 48px;
            margin: 0 0 20px 0;
            font-weight: bold;
        }
        p {
            font-size: 24px;
            margin: 0;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Himanjali Sankar</h1>
        <p>Award-winning Author</p>
    </div>
</body>
</html>
`;

// Write the HTML file
const htmlPath = path.join(__dirname, '../public/social-image-template.html');
fs.writeFileSync(htmlPath, htmlContent);

console.log('✅ Created social image template at:', htmlPath);
console.log('📝 Note: This is a template. For production, you should:');
console.log('   1. Use a proper image generation library (like sharp)');
console.log('   2. Create a 1200x630px optimized image');
console.log('   3. Save it as social-image.png in the public folder');
console.log('   4. Ensure it\'s under 1MB for optimal social sharing');
