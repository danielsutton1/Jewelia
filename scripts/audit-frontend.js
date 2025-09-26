const fs = require('fs');
const path = require('path');

function auditFrontend() {
  console.log('🔍 COMPREHENSIVE FRONTEND AUDIT\n');
  console.log('=' .repeat(60));

  const projectRoot = path.join(__dirname, '..');
  
  // 1. Component Analysis
  console.log('\n📊 1. COMPONENT ANALYSIS');
  console.log('-'.repeat(40));

  const appDir = path.join(projectRoot, 'app');
  const componentsDir = path.join(projectRoot, 'components');
  
  // Analyze app directory structure
  console.log('📁 APP DIRECTORY STRUCTURE:');
  analyzeDirectory(appDir, 'app', 1);

  // Analyze components directory structure
  console.log('\n📁 COMPONENTS DIRECTORY STRUCTURE:');
  analyzeDirectory(componentsDir, 'components', 1);

  // 2. Page Components and Routes
  console.log('\n🌐 2. PAGE COMPONENTS AND ROUTES');
  console.log('-'.repeat(40));

  const pages = findPages(appDir);
  console.log(`✅ Found ${pages.length} page components:`);
  pages.forEach(page => {
    console.log(`   - ${page.route} (${page.file})`);
  });

  // 3. Shared Components
  console.log('\n🔧 3. SHARED COMPONENTS');
  console.log('-'.repeat(40));

  const sharedComponents = findSharedComponents(componentsDir);
  console.log(`✅ Found ${sharedComponents.length} shared components:`);
  sharedComponents.forEach(comp => {
    console.log(`   - ${comp.name} (${comp.category})`);
  });

  // 4. Business Feature Analysis
  console.log('\n🏢 4. BUSINESS FEATURE ANALYSIS');
  console.log('-'.repeat(40));

  const businessFeatures = analyzeBusinessFeatures(appDir, componentsDir);
  Object.entries(businessFeatures).forEach(([feature, status]) => {
    console.log(`   ${status.icon} ${feature}: ${status.description}`);
  });

  // 5. UI/UX Analysis
  console.log('\n🎨 5. UI/UX ANALYSIS');
  console.log('-'.repeat(40));

  analyzeUIUX(projectRoot);

  // 6. State Management Analysis
  console.log('\n📊 6. STATE MANAGEMENT ANALYSIS');
  console.log('-'.repeat(40));

  analyzeStateManagement(projectRoot);

  // 7. API Integration Analysis
  console.log('\n🔌 7. API INTEGRATION ANALYSIS');
  console.log('-'.repeat(40));

  analyzeAPIIntegration(projectRoot);

  console.log('\n' + '='.repeat(60));
  console.log('🎯 FRONTEND AUDIT COMPLETE');
  console.log('='.repeat(60));
}

function analyzeDirectory(dir, name, depth = 0) {
  if (!fs.existsSync(dir)) {
    console.log(`${'  '.repeat(depth)}❌ ${name}: Directory not found`);
    return;
  }

  const items = fs.readdirSync(dir);
  const files = items.filter(item => fs.statSync(path.join(dir, item)).isFile());
  const directories = items.filter(item => fs.statSync(path.join(dir, item)).isDirectory());

  console.log(`${'  '.repeat(depth)}📁 ${name}/`);
  
  directories.forEach(dirName => {
    analyzeDirectory(path.join(dir, dirName), dirName, depth + 1);
  });

  files.forEach(fileName => {
    const ext = path.extname(fileName);
    const icon = getFileIcon(ext);
    console.log(`${'  '.repeat(depth + 1)}${icon} ${fileName}`);
  });
}

function getFileIcon(ext) {
  const icons = {
    '.tsx': '⚛️',
    '.ts': '📝',
    '.js': '📝',
    '.jsx': '⚛️',
    '.css': '🎨',
    '.scss': '🎨',
    '.json': '📋',
    '.md': '📖'
  };
  return icons[ext] || '📄';
}

function findPages(appDir) {
  const pages = [];
  
  function scanDirectory(dir, route = '') {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Check for page.tsx files
        const pageFile = path.join(fullPath, 'page.tsx');
        if (fs.existsSync(pageFile)) {
          const routePath = route + '/' + item;
          pages.push({
            route: routePath || '/',
            file: pageFile.replace(appDir, 'app')
          });
        }
        
        // Recursively scan subdirectories
        scanDirectory(fullPath, route + '/' + item);
      }
    });
  }

  scanDirectory(appDir);
  return pages;
}

function findSharedComponents(componentsDir) {
  const components = [];
  
  if (!fs.existsSync(componentsDir)) return components;

  function scanDirectory(dir, category = '') {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Check for index.tsx or component files
        const indexFile = path.join(fullPath, 'index.tsx');
        const componentFile = path.join(fullPath, `${item}.tsx`);
        
        if (fs.existsSync(indexFile) || fs.existsSync(componentFile)) {
          components.push({
            name: item,
            category: category || 'general',
            path: fullPath.replace(componentsDir, 'components')
          });
        }
        
        // Recursively scan subdirectories
        scanDirectory(fullPath, item);
      }
    });
  }

  scanDirectory(componentsDir);
  return components;
}

function analyzeBusinessFeatures(appDir, componentsDir) {
  const features = {
    'Dashboard': { icon: '📊', description: 'Main dashboard with analytics' },
    'Customer Management': { icon: '👥', description: 'Customer CRUD operations' },
    'Order Processing': { icon: '📦', description: 'Order management system' },
    'Product Management': { icon: '🏷️', description: 'Product catalog and inventory' },
    'Inventory Management': { icon: '📋', description: 'Stock tracking and management' },
    'Quote System': { icon: '💼', description: 'Quote generation and management' },
    'Asset Tracking': { icon: '📍', description: 'Asset location and movement tracking' },
    'Materials Management': { icon: '🔧', description: 'Material tracking and management' },
    'CAD Files': { icon: '🎨', description: 'CAD file management system' },
    'Financial Management': { icon: '💰', description: 'Accounts payable/receivable' },
    'Trade-ins': { icon: '🔄', description: 'Trade-in processing system' },
    'Consignment': { icon: '🤝', description: 'Consignment management' },
    'Repairs': { icon: '🔧', description: 'Repair tracking system' },
    'User Management': { icon: '👤', description: 'User authentication and roles' },
    'Authentication': { icon: '🔐', description: 'Login/logout system' },
    'Settings': { icon: '⚙️', description: 'Application settings' }
  };

  const results = {};

  Object.entries(features).forEach(([feature, info]) => {
    const hasPage = checkFeatureExists(appDir, feature.toLowerCase());
    const hasComponents = checkComponentsExist(componentsDir, feature.toLowerCase());
    
    if (hasPage && hasComponents) {
      results[feature] = { ...info, status: '✅ Complete' };
    } else if (hasPage || hasComponents) {
      results[feature] = { ...info, status: '🟡 Partial' };
    } else {
      results[feature] = { ...info, status: '❌ Missing' };
    }
  });

  return results;
}

function checkFeatureExists(appDir, feature) {
  const featureDirs = [
    'dashboard',
    'customers',
    'orders',
    'products',
    'inventory',
    'quotes',
    'asset-tracking',
    'materials',
    'cad',
    'finance',
    'trade-ins',
    'consignment',
    'repairs',
    'users',
    'auth',
    'settings'
  ];

  return featureDirs.some(dir => {
    const fullPath = path.join(appDir, dir);
    return fs.existsSync(fullPath);
  });
}

function checkComponentsExist(componentsDir, feature) {
  if (!fs.existsSync(componentsDir)) return false;

  const items = fs.readdirSync(componentsDir);
  return items.some(item => {
    const itemPath = path.join(componentsDir, item);
    return fs.statSync(itemPath).isDirectory() && 
           (item.toLowerCase().includes(feature) || feature.includes(item.toLowerCase()));
  });
}

function analyzeUIUX(projectRoot) {
  // Check for design system
  const uiDir = path.join(projectRoot, 'components', 'ui');
  const stylesDir = path.join(projectRoot, 'styles');
  const globalsCss = path.join(projectRoot, 'app', 'globals.css');
  const componentsDir = path.join(projectRoot, 'components');

  console.log('🎨 Design System:');
  if (fs.existsSync(uiDir)) {
    const uiComponents = fs.readdirSync(uiDir).filter(item => 
      fs.statSync(path.join(uiDir, item)).isFile()
    );
    console.log(`   ✅ UI Components: ${uiComponents.length} components found`);
  } else {
    console.log('   ❌ UI Components: No dedicated UI component library');
  }

  if (fs.existsSync(globalsCss)) {
    console.log('   ✅ Global Styles: globals.css exists');
  } else {
    console.log('   ❌ Global Styles: No global CSS file');
  }

  // Check for responsive design
  console.log('\n📱 Responsive Design:');
  const hasResponsiveHooks = fs.existsSync(path.join(projectRoot, 'hooks', 'use-media-query.ts'));
  const hasMobileHooks = fs.existsSync(path.join(projectRoot, 'hooks', 'use-mobile.tsx'));
  
  if (hasResponsiveHooks || hasMobileHooks) {
    console.log('   ✅ Responsive hooks found');
  } else {
    console.log('   ⚠️  No responsive design hooks detected');
  }

  // Check for navigation
  console.log('\n🧭 Navigation:');
  const hasNavigation = fs.existsSync(path.join(componentsDir, 'navigation'));
  if (hasNavigation) {
    console.log('   ✅ Navigation components exist');
  } else {
    console.log('   ❌ No dedicated navigation components');
  }
}

function analyzeStateManagement(projectRoot) {
  console.log('📊 State Management Analysis:');
  
  // Check for context providers
  const providersDir = path.join(projectRoot, 'components', 'providers');
  if (fs.existsSync(providersDir)) {
    const providers = fs.readdirSync(providersDir).filter(item => 
      fs.statSync(path.join(providersDir, item)).isFile()
    );
    console.log(`   ✅ Context Providers: ${providers.length} providers found`);
  } else {
    console.log('   ❌ Context Providers: No providers directory');
  }

  // Check for custom hooks
  const hooksDir = path.join(projectRoot, 'hooks');
  if (fs.existsSync(hooksDir)) {
    const hooks = fs.readdirSync(hooksDir).filter(item => 
      fs.statSync(path.join(hooksDir, item)).isFile()
    );
    console.log(`   ✅ Custom Hooks: ${hooks.length} hooks found`);
  } else {
    console.log('   ❌ Custom Hooks: No hooks directory');
  }

  // Check for services
  const servicesDir = path.join(projectRoot, 'lib', 'services');
  if (fs.existsSync(servicesDir)) {
    const services = fs.readdirSync(servicesDir).filter(item => 
      fs.statSync(path.join(servicesDir, item)).isFile()
    );
    console.log(`   ✅ Services: ${services.length} service files found`);
  } else {
    console.log('   ❌ Services: No services directory');
  }
}

function analyzeAPIIntegration(projectRoot) {
  console.log('🔌 API Integration Analysis:');
  
  // Check for API routes
  const apiDir = path.join(projectRoot, 'app', 'api');
  if (fs.existsSync(apiDir)) {
    const apiRoutes = fs.readdirSync(apiDir).filter(item => 
      fs.statSync(path.join(apiDir, item)).isDirectory()
    );
    console.log(`   ✅ API Routes: ${apiRoutes.length} routes found`);
    apiRoutes.forEach(route => {
      console.log(`      - /api/${route}`);
    });
  } else {
    console.log('   ❌ API Routes: No API directory');
  }

  // Check for API service
  const apiService = path.join(projectRoot, 'lib', 'api-service.ts');
  if (fs.existsSync(apiService)) {
    console.log('   ✅ API Service: api-service.ts exists');
  } else {
    console.log('   ❌ API Service: No centralized API service');
  }

  // Check for Supabase configuration
  const supabaseConfig = path.join(projectRoot, 'lib', 'supabase');
  if (fs.existsSync(supabaseConfig)) {
    console.log('   ✅ Supabase Config: Supabase configuration exists');
  } else {
    console.log('   ❌ Supabase Config: No Supabase configuration');
  }
}

auditFrontend(); 