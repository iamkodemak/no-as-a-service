const assert = require('assert');
const http = require('http');

// Simple test runner
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

async function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: process.env.PORT || 3000,
      path,
      method: 'GET',
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('\nRunning API tests...\n');

  // Test /api/no endpoint
  try {
    const res = await testEndpoint('/api/no');
    test('GET /api/no returns 200', () => {
      assert.strictEqual(res.status, 200);
    });
    test('GET /api/no returns JSON', () => {
      assert.strictEqual(res.headers['content-type'], 'application/json');
    });
    test('GET /api/no response has "no" field', () => {
      const body = JSON.parse(res.body);
      assert.ok(body.no, 'Response should have a "no" field');
    });
    test('GET /api/no response has "reason" field', () => {
      const body = JSON.parse(res.body);
      assert.ok(body.reason, 'Response should have a "reason" field');
    });
  } catch (err) {
    console.error('Could not connect to server. Is it running?', err.message);
    process.exit(1);
  }

  // Test /api/no/plain endpoint
  try {
    const res = await testEndpoint('/api/no/plain');
    test('GET /api/no/plain returns 200', () => {
      assert.strictEqual(res.status, 200);
    });
    test('GET /api/no/plain returns plain text', () => {
      assert.ok(res.headers['content-type'].includes('text/plain'));
    });
    test('GET /api/no/plain body is a non-empty string', () => {
      assert.ok(res.body.length > 0);
    });
  } catch (err) {
    console.error('Failed /api/no/plain tests:', err.message);
  }

  // Test unknown route returns 404
  try {
    const res = await testEndpoint('/nonexistent');
    test('GET /nonexistent returns 404', () => {
      assert.strictEqual(res.status, 404);
    });
  } catch (err) {
    console.error('Failed 404 test:', err.message);
  }

  console.log(`\n${passed} passing, ${failed} failing\n`);
  if (failed > 0) process.exit(1);
}

runTests();
