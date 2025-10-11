const https = require('https');
const http = require('http');

async function testSwagger(baseUrl) {
  console.log(`🧪 Testing Swagger endpoints at: ${baseUrl}`);

  const endpoints = [
    { path: '/health', name: 'Health Check' },
    { path: '/api/v1/docs-json', name: 'OpenAPI JSON' },
    { path: '/api/v1/docs', name: 'Swagger UI' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing ${endpoint.name}...`);

      const url = `${baseUrl}${endpoint.path}`;
      const isHttps = url.startsWith('https://');
      const client = isHttps ? https : http;

      const response = await new Promise((resolve, reject) => {
        const req = client.get(url, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ statusCode: res.statusCode, data, headers: res.headers }));
        });

        req.on('error', reject);
        req.setTimeout(10000, () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });
      });

      if (response.statusCode === 200) {
        console.log(`✅ ${endpoint.name}: OK (${response.statusCode})`);

        if (endpoint.path === '/api/v1/docs-json') {
          try {
            const spec = JSON.parse(response.data);
            console.log(`   📊 OpenAPI Version: ${spec.openapi}`);
            console.log(`   📝 API Title: ${spec.info.title}`);
            console.log(`   🔢 Endpoints: ${Object.keys(spec.paths || {}).length}`);
            console.log(`   🏷️  Tags: ${Object.keys(spec.tags || {}).length}`);
          } catch (e) {
            console.log(`   ⚠️  Could not parse JSON response`);
          }
        }

        if (endpoint.path === '/api/v1/docs') {
          if (response.data.includes('swagger-ui')) {
            console.log(`   🎨 Swagger UI: Detected`);
          } else {
            console.log(`   ⚠️  Swagger UI: Not detected in response`);
          }
        }

      } else {
        console.log(`❌ ${endpoint.name}: FAILED (${response.statusCode})`);
      }

    } catch (error) {
      console.log(`❌ ${endpoint.name}: ERROR - ${error.message}`);
    }
  }

  console.log(`\n🎉 Swagger testing completed!`);
  console.log(`\n📚 Access Swagger UI at: ${baseUrl}/api/v1/docs`);
  console.log(`📄 Download OpenAPI spec: ${baseUrl}/api/v1/docs-json`);
}

// Get base URL from command line argument or use default
const baseUrl = process.argv[2] || 'http://localhost:3001';

if (baseUrl === '--help' || baseUrl === '-h') {
  console.log(`
🧪 Swagger Testing Script

Usage:
  node scripts/test-swagger.js [baseUrl]

Examples:
  node scripts/test-swagger.js                           # Test localhost:3001
  node scripts/test-swagger.js http://localhost:3001     # Test localhost:3001
  node scripts/test-swagger.js https://api.aiquaa.com    # Test production API

The script will test:
- Health check endpoint
- OpenAPI JSON specification
- Swagger UI availability
`);
  process.exit(0);
}

testSwagger(baseUrl).catch(console.error);
