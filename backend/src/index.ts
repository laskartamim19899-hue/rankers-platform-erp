import path from 'path';
import dotenv from 'dotenv';
import dns from 'dns';

// Configure custom DNS server for node resolver to bypass local query refused DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

const originalLookup = dns.lookup;
(dns as any).lookup = function(hostname: string, options: any, callback: any) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  if (hostname && hostname.includes('neon.tech')) {
    dns.resolve4(hostname, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        originalLookup(hostname, options, callback);
      } else {
        const ip = addresses[0];
        if (options && options.all) {
          callback(null, [{ address: ip, family: 4 }]);
        } else {
          callback(null, ip, 4);
        }
      }
    });
  } else {
    originalLookup(hostname, options, callback);
  }
};

// Load .env with explicit path relative to __dirname so it works regardless of CWD
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('[STARTUP] DATABASE_URL set:', !!process.env.DATABASE_URL);

import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
