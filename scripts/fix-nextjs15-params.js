#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Fix Next.js 15 params compatibility issues
function fixNextJS15Params() {
  console.log('🔧 Fixing Next.js 15 params compatibility issues...');
  
  // Find all API route files
  const apiFiles = glob.sync('app/api/**/*.ts');
  
  let fixedCount = 0;
  
  apiFiles.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      // Fix params type from { params: { id: string } } to { params: Promise<{ id: string }> }
      content = content.replace(
        /(\{ params \}: \{ params: \{ ([^}]+) \})/g,
        (match, fullMatch, paramsContent) => {
          // Extract the parameter names and types
          const params = paramsContent.split(',').map(p => p.trim());
          const fixedParams = params.map(p => {
            const [name, type] = p.split(':').map(s => s.trim());
            return `${name}: ${type}`;
          }).join(', ');
          
          return `{ params }: { params: Promise<{ ${fixedParams} }> }`;
        }
      );
      
      // Fix params destructuring from const { id } = params to const { id } = await params
      content = content.replace(
        /const \{ ([^}]+) \} = params/g,
        (match, destructured) => {
          return `const { ${destructured} } = await params`;
        }
      );
      
      // If content changed, write it back
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${filePath}`);
        fixedCount++;
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  });
  
  console.log(`\n🎉 Fixed ${fixedCount} API route files for Next.js 15 compatibility!`);
}

// Fix page files that might have the same issue
function fixPageFiles() {
  console.log('\n🔧 Fixing page files for Next.js 15 compatibility...');
  
  // Find all page files with dynamic routes
  const pageFiles = glob.sync('app/**/[*]/page.tsx');
  
  let fixedCount = 0;
  
  pageFiles.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      // Fix params type in page components
      content = content.replace(
        /(\{ params \}: \{ params: \{ ([^}]+) \})/g,
        (match, fullMatch, paramsContent) => {
          // Extract the parameter names and types
          const params = paramsContent.split(',').map(p => p.trim());
          const fixedParams = params.map(p => {
            const [name, type] = p.split(':').map(s => s.trim());
            return `${name}: ${type}`;
          }).join(', ');
          
          return `{ params }: { params: Promise<{ ${fixedParams} }> }`;
        }
      );
      
      // Fix params destructuring in page components
      content = content.replace(
        /const \{ ([^}]+) \} = params/g,
        (match, destructured) => {
          return `const { ${destructured} } = await params`;
        }
      );
      
      // If content changed, write it back
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${filePath}`);
        fixedCount++;
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  });
  
  console.log(`\n🎉 Fixed ${fixedCount} page files for Next.js 15 compatibility!`);
}

// Main execution
if (require.main === module) {
  try {
    fixNextJS15Params();
    fixPageFiles();
    console.log('\n🚀 All Next.js 15 compatibility issues have been fixed!');
  } catch (error) {
    console.error('❌ Error during fix process:', error);
    process.exit(1);
  }
}

module.exports = { fixNextJS15Params, fixPageFiles };
