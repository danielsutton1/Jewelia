const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../app/api');

function setupApiRoutes(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Create config.ts in each API route directory
      const configPath = path.join(filePath, 'config.ts');
      if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, `export const dynamic = 'force-dynamic';\nexport const revalidate = 0;\n`);
      }
      setupApiRoutes(filePath);
    }
  });
}

setupApiRoutes(apiDir); 