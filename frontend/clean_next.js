const fs = require('fs');
try {
  fs.rmSync('.next', { recursive: true, force: true });
  console.log('Successfully deleted .next directory');
} catch (e) {
  console.error('Failed to delete:', e.message);
}
