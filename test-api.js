const http = require('http');

const postData = JSON.stringify({
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  username: 'testuser',
  age: 25
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log('RESPONSE:', data); });
});

req.on('error', (e) => { console.error(`problem with request: ${e.message}`); });
req.write(postData);
req.end();
