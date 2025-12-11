const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3021,
  path: '/api/auctions?limit=5',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('📊 API Response Analysis:');
      console.log('- Success:', json.success);
      console.log('- Total auctions:', json.data?.pagination?.total || 0);
      console.log('\n🔍 Promotion data for each auction:');

      if (json.data?.auctions) {
        json.data.auctions.forEach((a, i) => {
          console.log(`\n[${i + 1}] ${a.id || 'N/A'}:`);
          console.log('    - featured:', a.featured);
          console.log('    - promotionPackage:', a.promotionPackage);
          console.log('    - promotionPriority:', a.promotionPriority);
        });
      }
    } catch (e) {
      console.error('Parse error:', e.message);
      console.log('Raw response:', data.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();
