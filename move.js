const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'app');
const shopDir = path.join(srcDir, '(shop)');

// Create directory if it doesn't exist
if (!fs.existsSync(shopDir)) {
  fs.mkdirSync(shopDir);
}

const filesToMove = [
  'page.jsx',
  'products',
  'subscriptions',
  'gaming',
  'devices',
  'login',
  'register',
  'account',
  'product',
  'category',
  'checkout'
];

filesToMove.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(shopDir, file);
  
  if (fs.existsSync(srcPath)) {
    try {
      fs.renameSync(srcPath, destPath);
      console.log(`Successfully moved ${file}`);
    } catch (err) {
      console.error(`Error moving ${file}:`, err);
    }
  } else {
    console.log(`Skipped ${file} - does not exist`);
  }
});
