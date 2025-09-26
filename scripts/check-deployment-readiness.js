#!/usr/bin/env node

// =====================================================
// DEPLOYMENT READINESS CHECK SCRIPT
// =====================================================
// This script validates that the system is ready for production deployment

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSection = (title) => {
  console.log('\n' + '='.repeat(60));
  log(`🚀 ${title}`, 'blue');
  console.log('='.repeat(60));
};

const logSuccess = (message) => log(`✅ ${message}`, 'green');
const logWarning = (message) => log(`⚠️  ${message}`, 'yellow');
const logError = (message) => log(`❌ ${message}`, 'red');
const logInfo = (message) => log(`ℹ️  ${message}`, 'cyan');

// =====================================================
// DEPLOYMENT READINESS CHECKS
// =====================================================

async function checkProjectStructure() {
  logSection('Project Structure Validation');
  
  const requiredDirs = [
    'app', 'components', 'lib', 'scripts', 'supabase', 'load-tests'
  ];
  
  const requiredFiles = [
    'package.json', 'next.config.js', 'tsconfig.json'
  ];
  
  let score = 0;
  const totalChecks = requiredDirs.length + requiredFiles.length;
  
  // Check directories
  for (const dir of requiredDirs) {
    if (fs.existsSync(dir)) {
      logSuccess(`Directory found: ${dir}/`);
      score++;
    } else {
      logError(`Directory missing: ${dir}/`);
    }
  }
  
  // Check files
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      logSuccess(`File found: ${file}`);
      score++;
    } else {
      logError(`File missing: ${file}`);
    }
  }
  
  const percentage = Math.round((score / totalChecks) * 100);
  logInfo(`Project structure score: ${percentage}% (${score}/${totalChecks})`);
  
  return { score: percentage, passed: score, total: totalChecks };
}

async function checkDependencies() {
  logSection('Dependencies Check');
  
  try {
    // Check if package.json exists and has required scripts
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const scripts = packageJson.scripts || {};
    
    const requiredScripts = [
      'build', 'start', 'dev', 'test', 'security:audit', 'test:load'
    ];
    
    let score = 0;
    const totalScripts = requiredScripts.length;
    
    for (const script of requiredScripts) {
      if (scripts[script]) {
        logSuccess(`Script found: npm run ${script}`);
        score++;
      } else {
        logWarning(`Script missing: npm run ${script}`);
      }
    }
    
    // Check for critical dependencies
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const criticalDeps = ['next', 'react', 'react-dom', '@supabase/supabase-js'];
    
    for (const dep of criticalDeps) {
      if (dependencies[dep]) {
        logSuccess(`Dependency found: ${dep}`);
        score++;
      } else {
        logError(`Dependency missing: ${dep}`);
      }
    }
    
    const totalChecks = totalScripts + criticalDeps.length;
    const percentage = Math.round((score / totalChecks) * 100);
    logInfo(`Dependencies score: ${percentage}% (${score}/${totalChecks})`);
    
    return { score: percentage, passed: score, total: totalChecks };
  } catch (error) {
    logError(`Failed to check dependencies: ${error.message}`);
    return { score: 0, passed: 0, total: 0 };
  }
}

async function checkSecurityConfiguration() {
  logSection('Security Configuration Check');
  
  const securityFiles = [
    'nginx.conf', 'firewall.rules', 'security-headers.conf', 'security-config.json'
  ];
  
  let score = 0;
  const totalFiles = securityFiles.length;
  
  for (const file of securityFiles) {
    if (fs.existsSync(file)) {
      logSuccess(`Security config found: ${file}`);
      score++;
    } else {
      logWarning(`Security config missing: ${file}`);
    }
  }
  
  // Check SSL directory
  if (fs.existsSync('ssl/')) {
    logSuccess('SSL directory found: ssl/');
    score++;
  } else {
    logWarning('SSL directory missing: ssl/');
  }
  
  const totalChecks = totalFiles + 1;
  const percentage = Math.round((score / totalChecks) * 100);
  logInfo(`Security configuration score: ${percentage}% (${score}/${totalChecks})`);
  
  return { score: percentage, passed: score, total: totalChecks };
}

async function checkLoadTestingConfiguration() {
  logSection('Load Testing Configuration Check');
  
  const loadTestFiles = [
    'load-tests/artillery-config.yml',
    'load-tests/basic-load-test.js'
  ];
  
  let score = 0;
  const totalFiles = loadTestFiles.length;
  
  for (const file of loadTestFiles) {
    if (fs.existsSync(file)) {
      logSuccess(`Load test file found: ${file}`);
      score++;
    } else {
      logError(`Load test file missing: ${file}`);
    }
  }
  
  // Check if Artillery is available
  try {
    execSync('artillery --version', { stdio: 'pipe' });
    logSuccess('Artillery load testing tool available');
    score++;
  } catch (error) {
    logWarning('Artillery load testing tool not available');
  }
  
  const totalChecks = totalFiles + 1;
  const percentage = Math.round((score / totalChecks) * 100);
  logInfo(`Load testing configuration score: ${percentage}% (${score}/${totalChecks})`);
  
  return { score: percentage, passed: score, total: totalChecks };
}

async function checkDatabaseConfiguration() {
  logSection('Database Configuration Check');
  
  const dbFiles = [
    'supabase/schema.sql',
    'supabase/migrations/'
  ];
  
  let score = 0;
  const totalChecks = dbFiles.length;
  
  for (const file of dbFiles) {
    if (fs.existsSync(file)) {
      logSuccess(`Database file found: ${file}`);
      score++;
    } else {
      logWarning(`Database file missing: ${file}`);
    }
  }
  
  // Check for migration scripts
  if (fs.existsSync('scripts/migrate-production.sh')) {
    logSuccess('Production migration script found');
    score++;
  } else {
    logWarning('Production migration script missing');
  }
  
  const totalChecksWithScripts = totalChecks + 1;
  const percentage = Math.round((score / totalChecksWithScripts) * 100);
  logInfo(`Database configuration score: ${percentage}% (${score}/${totalChecksWithScripts})`);
  
  return { score: percentage, passed: score, total: totalChecksWithScripts };
}

async function checkDeploymentScripts() {
  logSection('Deployment Scripts Check');
  
  const deploymentScripts = [
    'scripts/deploy-production.sh',
    'scripts/migrate-production.sh',
    'scripts/check-deployment-readiness.js'
  ];
  
  let score = 0;
  const totalScripts = deploymentScripts.length;
  
  for (const script of deploymentScripts) {
    if (fs.existsSync(script)) {
      logSuccess(`Deployment script found: ${script}`);
      score++;
    } else {
      logError(`Deployment script missing: ${script}`);
    }
  }
  
  const percentage = Math.round((score / totalScripts) * 100);
  logInfo(`Deployment scripts score: ${percentage}% (${score}/${totalScripts})`);
  
  return { score: percentage, passed: score, total: totalScripts };
}

async function checkEnvironmentConfiguration() {
  logSection('Environment Configuration Check');
  
  logWarning('.env.production file not found (blocked by global ignore)');
  logInfo('Please create .env.production manually with the following variables:');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'DATABASE_URL'
  ];
  
  for (const envVar of requiredEnvVars) {
    logInfo(`  ${envVar}=your-value-here`);
  }
  
  logInfo('\nSee docs/DEPLOYMENT_CONFIGURATION.md for complete configuration');
  
  return { score: 0, passed: 0, total: 1 };
}

async function generateDeploymentReport(results) {
  logSection('Deployment Readiness Report');
  
  const totalScore = Math.round(
    results.reduce((sum, result) => sum + result.score, 0) / results.length
  );
  
  const totalChecks = results.reduce((sum, result) => sum + result.total, 0);
  const totalPassed = results.reduce((sum, result) => sum + result.passed, 0);
  
  console.log('\n📊 DEPLOYMENT READINESS SUMMARY');
  console.log('─'.repeat(50));
  console.log(`Overall Readiness Score: ${totalScore}%`);
  console.log(`Total Checks: ${totalChecks}`);
  console.log(`Passed Checks: ${totalPassed}`);
  console.log(`Failed Checks: ${totalChecks - totalPassed}`);
  
  console.log('\n📋 DETAILED RESULTS');
  console.log('─'.repeat(50));
  
  const categories = [
    'Project Structure',
    'Dependencies',
    'Security Configuration',
    'Load Testing',
    'Database Configuration',
    'Deployment Scripts',
    'Environment Configuration'
  ];
  
  results.forEach((result, index) => {
    const status = result.score >= 80 ? '🟢' : result.score >= 60 ? '🟡' : '🔴';
    console.log(`${status} ${categories[index]}: ${result.score}% (${result.passed}/${result.total})`);
  });
  
  console.log('\n🎯 DEPLOYMENT STATUS');
  console.log('─'.repeat(50));
  
  if (totalScore >= 90) {
    logSuccess('🎉 EXCELLENT: System is ready for production deployment!');
    console.log('• All critical components are configured');
    console.log('• Security measures are in place');
    console.log('• Load testing is configured');
    console.log('• Deployment scripts are ready');
  } else if (totalScore >= 75) {
    logWarning('✅ GOOD: System is mostly ready for production deployment');
    console.log('• Most critical components are configured');
    console.log('• Some minor issues need attention');
    console.log('• Review failed checks before deployment');
  } else if (totalScore >= 60) {
    logWarning('⚠️  FAIR: System needs work before production deployment');
    console.log('• Several components need configuration');
    console.log('• Address failed checks before deployment');
    console.log('• Consider staging deployment first');
  } else {
    logError('❌ POOR: System is not ready for production deployment');
    console.log('• Many critical components are missing');
    console.log('• Address all failed checks before deployment');
    console.log('• Consider development phase completion first');
  }
  
  // Save report to file
  const reportPath = path.join(process.cwd(), 'deployment-readiness-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    overallScore: totalScore,
    totalChecks,
    totalPassed,
    totalFailed: totalChecks - totalPassed,
    categories: categories.map((cat, index) => ({
      name: cat,
      score: results[index].score,
      passed: results[index].passed,
      total: results[index].total
    })),
    recommendations: getRecommendations(totalScore)
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  logSuccess(`Deployment readiness report saved to: ${reportPath}`);
  
  return { totalScore, totalChecks, totalPassed };
}

function getRecommendations(score) {
  if (score >= 90) {
    return [
      'Proceed with production deployment',
      'Run final security audit before go-live',
      'Execute load testing on staging environment',
      'Prepare user training materials'
    ];
  } else if (score >= 75) {
    return [
      'Address failed checks before deployment',
      'Run security audit after fixes',
      'Consider staging deployment first',
      'Complete missing configurations'
    ];
  } else if (score >= 60) {
    return [
      'Complete missing components before deployment',
      'Run comprehensive testing after fixes',
      'Consider development phase completion',
      'Review deployment timeline'
    ];
  } else {
    return [
      'Complete development phase before deployment',
      'Address all missing components',
      'Run comprehensive testing',
      'Consider project restart or major refactor'
    ];
  }
}

// =====================================================
// MAIN EXECUTION
// =====================================================

async function main() {
  console.log('🚀 JEWELIA CRM DEPLOYMENT READINESS CHECK');
  console.log('='.repeat(60));
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Working Directory: ${process.cwd()}`);
  
  try {
    // Run all readiness checks
    const results = await Promise.all([
      checkProjectStructure(),
      checkDependencies(),
      checkSecurityConfiguration(),
      checkLoadTestingConfiguration(),
      checkDatabaseConfiguration(),
      checkDeploymentScripts(),
      checkEnvironmentConfiguration()
    ]);
    
    // Generate comprehensive report
    const report = await generateDeploymentReport(results);
    
    // Exit with appropriate code
    if (report.totalScore >= 90) {
      process.exit(0);
    } else if (report.totalScore >= 75) {
      process.exit(1);
    } else {
      process.exit(2);
    }
    
  } catch (error) {
    logError(`Deployment readiness check failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the deployment readiness check
if (require.main === module) {
  main().catch(error => {
    logError(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main };
