#!/usr/bin/env node

// =====================================================
// SECURITY AUDIT SCRIPT
// =====================================================
// This script runs a comprehensive security audit
// for the Jewelia CRM system

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSection = (title) => {
  console.log('\n' + '='.repeat(60));
  log(`🔒 ${title}`, 'blue');
  console.log('='.repeat(60));
};

const logSuccess = (message) => log(`✅ ${message}`, 'green');
const logWarning = (message) => log(`⚠️  ${message}`, 'yellow');
const logError = (message) => log(`❌ ${message}`, 'red');
const logInfo = (message) => log(`ℹ️  ${message}`, 'cyan');

// =====================================================
// SECURITY AUDIT FUNCTIONS
// =====================================================

async function runDependencyAudit() {
  logSection('Dependency Vulnerability Scan');
  
  try {
    logInfo('Running npm audit...');
    const result = execSync('npm audit', { encoding: 'utf8', stdio: 'pipe' });
    
    // Parse the text output to extract vulnerability counts
    const criticalMatch = result.match(/(\d+) critical/);
    const highMatch = result.match(/(\d+) high/);
    const moderateMatch = result.match(/(\d+) moderate/);
    const lowMatch = result.match(/(\d+) low/);
    
    const critical = criticalMatch ? parseInt(criticalMatch[1]) : 0;
    const high = highMatch ? parseInt(highMatch[1]) : 0;
    const moderate = moderateMatch ? parseInt(moderateMatch[1]) : 0;
    const low = lowMatch ? parseInt(lowMatch[1]) : 0;
    
    const total = critical + high + moderate + low;
    
    if (total === 0) {
      logSuccess('No vulnerabilities found in dependencies');
      return { score: 100, issues: 0 };
    }
    
    logWarning(`Found vulnerabilities: ${critical} critical, ${high} high, ${moderate} moderate, ${low} low`);
    
    // Calculate security score
    let score = 100;
    score -= critical * 25;
    score -= high * 15;
    score -= moderate * 10;
    score -= low * 5;
    score = Math.max(0, score);
    
    if (score < 50) {
      logError(`Security score: ${score}/100 - CRITICAL ISSUES DETECTED`);
    } else if (score < 75) {
      logWarning(`Security score: ${score}/100 - HIGH RISK ISSUES DETECTED`);
    } else {
      logInfo(`Security score: ${score}/100 - ACCEPTABLE RISK LEVEL`);
    }
    
    return { score, issues: total };
  } catch (error) {
    // npm audit returns exit code 1 when vulnerabilities are found
    if (error.status === 1) {
      try {
        // Try to parse the stderr output
        const stderr = error.stderr ? error.stderr.toString() : '';
        const stdout = error.stdout ? error.stdout.toString() : '';
        const output = stdout + stderr;
        
        // Parse the text output to extract vulnerability counts
        const criticalMatch = output.match(/(\d+) critical/);
        const highMatch = output.match(/(\d+) high/);
        const moderateMatch = output.match(/(\d+) moderate/);
        const lowMatch = output.match(/(\d+) low/);
        
        const critical = criticalMatch ? parseInt(criticalMatch[1]) : 0;
        const high = highMatch ? parseInt(highMatch[1]) : 0;
        const moderate = moderateMatch ? parseInt(moderateMatch[1]) : 0;
        const low = lowMatch ? parseInt(lowMatch[1]) : 0;
        
        const total = critical + high + moderate + low;
        
        if (total === 0) {
          logSuccess('No vulnerabilities found in dependencies');
          return { score: 100, issues: 0 };
        }
        
        logWarning(`Found vulnerabilities: ${critical} critical, ${high} high, ${moderate} moderate, ${low} low`);
        
        // Calculate security score
        let score = 100;
        score -= critical * 25;
        score -= high * 15;
        score -= moderate * 10;
        score -= low * 5;
        score = Math.max(0, score);
        
        if (score < 50) {
          logError(`Security score: ${score}/100 - CRITICAL ISSUES DETECTED`);
        } else if (score < 75) {
          logWarning(`Security score: ${score}/100 - HIGH RISK ISSUES DETECTED`);
        } else {
          logInfo(`Security score: ${score}/100 - ACCEPTABLE RISK LEVEL`);
        }
        
        return { score, issues: total };
      } catch (parseError) {
        logError(`Failed to parse npm audit output: ${parseError.message}`);
        return { score: 0, issues: 999 };
      }
    } else {
      logError(`Dependency audit failed: ${error.message}`);
      return { score: 0, issues: 999 };
    }
  }
}

async function checkEnvironmentSecurity() {
  logSection('Environment Security Check');
  
  const envFile = path.join(process.cwd(), '.env.production');
  let score = 100;
  let issues = 0;
  
  if (!fs.existsSync(envFile)) {
    logWarning('.env.production file not found');
    score -= 20;
    issues++;
  } else {
    logSuccess('.env.production file exists');
    
    const envContent = fs.readFileSync(envFile, 'utf8');
    
    // Check for common security issues
    if (envContent.includes('password123') || envContent.includes('admin')) {
      logError('Found hardcoded credentials in environment file');
      score -= 30;
      issues++;
    }
    
    if (envContent.includes('localhost') && envContent.includes('production')) {
      logWarning('Found localhost references in production environment');
      score -= 15;
      issues++;
    }
    
    if (envContent.includes('test') || envContent.includes('dev')) {
      logWarning('Found development/test references in production environment');
      score -= 15;
      issues++;
    }
  }
  
  // Check for environment variable exposure
  const sensitiveVars = ['JWT_SECRET', 'ENCRYPTION_KEY', 'DATABASE_URL'];
  for (const varName of sensitiveVars) {
    if (process.env[varName]) {
      logWarning(`Sensitive environment variable ${varName} is set`);
      score -= 10;
      issues++;
    }
  }
  
  logInfo(`Environment security score: ${score}/100`);
  return { score, issues };
}

async function checkFilePermissions() {
  logSection('File Permission Security Check');
  
  let score = 100;
  let issues = 0;
  
  const criticalFiles = [
    '.env.production',
    'package.json',
    'package-lock.json',
    'scripts/',
    'supabase/'
  ];
  
  for (const file of criticalFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      try {
        const stats = fs.statSync(filePath);
        const mode = stats.mode.toString(8);
        
        // Check if files are world-writable (very insecure)
        if (mode.endsWith('666') || mode.endsWith('777')) {
          logError(`${file} has insecure permissions: ${mode}`);
          score -= 25;
          issues++;
        } else if (mode.endsWith('664') || mode.endsWith('775')) {
          logWarning(`${file} has loose permissions: ${mode}`);
          score -= 10;
          issues++;
        } else {
          logSuccess(`${file} has secure permissions: ${mode}`);
        }
      } catch (error) {
        logWarning(`Could not check permissions for ${file}: ${error.message}`);
      }
    }
  }
  
  logInfo(`File permission security score: ${score}/100`);
  return { score, issues };
}

async function checkCodeSecurity() {
  logSection('Code Security Analysis');
  
  let score = 100;
  let issues = 0;
  
  // Check for common security anti-patterns in code
  const securityPatterns = [
    { pattern: /eval\s*\(/, description: 'eval() usage detected', severity: 25 },
    { pattern: /innerHTML\s*=/, description: 'innerHTML assignment detected', severity: 15 },
    { pattern: /document\.write\s*\(/, description: 'document.write() usage detected', severity: 15 },
    { pattern: /localStorage\[.*\]\s*=/, description: 'Unsafe localStorage usage detected', severity: 10 },
    { pattern: /sql\s*\+/, description: 'Potential SQL concatenation detected', severity: 20 },
    { pattern: /password.*=.*['"][^'"]{1,7}['"]/, description: 'Weak password validation detected', severity: 15 }
  ];
  
  // Whitelist patterns that are acceptable in certain contexts
  const whitelistPatterns = [
    { pattern: /printWindow\.document\.write/, description: 'Print window document.write (acceptable)', severity: 0 },
    { pattern: /win\.document\.write/, description: 'Print window document.write (acceptable)', severity: 0 },
    { pattern: /newWindow\.document\.write/, description: 'New window document.write (acceptable)', severity: 0 }
  ];
  
  const sourceDirs = ['app/', 'components/', 'lib/', 'scripts/'];
  
  for (const dir of sourceDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      try {
        const files = getAllFiles(dirPath);
        
        for (const file of files) {
          if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx')) {
            const content = fs.readFileSync(file, 'utf8');
            
            for (const pattern of securityPatterns) {
              if (pattern.pattern.test(content)) {
                // Check if this pattern is whitelisted
                let isWhitelisted = false;
                for (const whitelistPattern of whitelistPatterns) {
                  if (whitelistPattern.pattern.test(content)) {
                    isWhitelisted = true;
                    break;
                  }
                }
                
                if (!isWhitelisted) {
                  logWarning(`${file}: ${pattern.description}`);
                  score -= pattern.severity;
                  issues++;
                } else {
                  logInfo(`${file}: ${pattern.description} (whitelisted)`);
                }
              }
            }
          }
        }
      } catch (error) {
        logWarning(`Could not analyze ${dir}: ${error.message}`);
      }
    }
  }
  
  logInfo(`Code security score: ${score}/100`);
  return { score, issues };
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }
  
  return arrayOfFiles;
}

async function checkInfrastructureSecurity() {
  logSection('Infrastructure Security Check');
  
  let score = 100;
  let issues = 0;
  
  // Check for security-related configuration files
  const securityConfigs = [
    '.htaccess',
    'nginx.conf',
    'firewall.rules',
    'security-headers.conf'
  ];
  
  for (const config of securityConfigs) {
    const configPath = path.join(process.cwd(), config);
    if (fs.existsSync(configPath)) {
      logSuccess(`Security configuration found: ${config}`);
    } else {
      logWarning(`Security configuration not found: ${config}`);
      score -= 10;
      issues++;
    }
  }
  
  // Check for SSL/TLS configuration
  const sslConfigs = [
    'ssl/',
    'certs/',
    'certificates/'
  ];
  
  let sslFound = false;
  for (const sslDir of sslConfigs) {
    const sslPath = path.join(process.cwd(), sslDir);
    if (fs.existsSync(sslPath)) {
      logSuccess(`SSL/TLS configuration found: ${sslDir}`);
      sslFound = true;
      break;
    }
  }
  
  if (!sslFound) {
    logWarning('SSL/TLS configuration not found');
    score -= 15;
    issues++;
  }
  
  logInfo(`Infrastructure security score: ${score}/100`);
  return { score, issues };
}

async function generateSecurityReport(results) {
  logSection('Security Audit Report');
  
  const totalScore = Math.round(
    results.reduce((sum, result) => sum + result.score, 0) / results.length
  );
  
  const totalIssues = results.reduce((sum, result) => sum + result.issues, 0);
  
  console.log('\n📊 SECURITY AUDIT SUMMARY');
  console.log('─'.repeat(40));
  console.log(`Overall Security Score: ${totalScore}/100`);
  console.log(`Total Issues Found: ${totalIssues}`);
  console.log(`Risk Level: ${getRiskLevel(totalScore)}`);
  
  console.log('\n📋 DETAILED RESULTS');
  console.log('─'.repeat(40));
  
  const categories = [
    'Dependencies',
    'Environment',
    'File Permissions',
    'Code Security',
    'Infrastructure'
  ];
  
  results.forEach((result, index) => {
    const status = result.score >= 80 ? '🟢' : result.score >= 60 ? '🟡' : '🔴';
    console.log(`${status} ${categories[index]}: ${result.score}/100 (${result.issues} issues)`);
  });
  
  console.log('\n🎯 RECOMMENDATIONS');
  console.log('─'.repeat(40));
  
  if (totalScore < 50) {
    logError('CRITICAL: System is not secure for production deployment');
    console.log('• Address all critical and high-severity vulnerabilities');
    console.log('• Review and fix security configurations');
    console.log('• Conduct additional security testing');
  } else if (totalScore < 75) {
    logWarning('HIGH RISK: Address security issues before production deployment');
    console.log('• Fix high and medium-severity vulnerabilities');
    console.log('• Review security configurations');
    console.log('• Consider additional security measures');
  } else if (totalScore < 90) {
    logInfo('MEDIUM RISK: Acceptable for production with monitoring');
    console.log('• Address remaining security issues');
    console.log('• Implement additional security measures');
    console.log('• Monitor for new vulnerabilities');
  } else {
    logSuccess('LOW RISK: System is secure for production deployment');
    console.log('• Continue monitoring for new vulnerabilities');
    console.log('• Maintain security best practices');
    console.log('• Schedule regular security reviews');
  }
  
  // Save report to file
  const reportPath = path.join(process.cwd(), 'security-audit-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    overallScore: totalScore,
    totalIssues,
    riskLevel: getRiskLevel(totalScore),
    categories: categories.map((cat, index) => ({
      name: cat,
      score: results[index].score,
      issues: results[index].issues
    })),
    recommendations: getRecommendations(totalScore)
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  logSuccess(`Security report saved to: ${reportPath}`);
  
  return { totalScore, totalIssues, riskLevel: getRiskLevel(totalScore) };
}

function getRiskLevel(score) {
  if (score >= 90) return 'LOW';
  if (score >= 75) return 'MEDIUM';
  if (score >= 50) return 'HIGH';
  return 'CRITICAL';
}

function getRecommendations(score) {
  if (score < 50) {
    return [
      'Address all critical and high-severity vulnerabilities immediately',
      'Review and fix security configurations',
      'Conduct additional security testing before deployment',
      'Consider engaging a security consultant'
    ];
  } else if (score < 75) {
    return [
      'Fix high and medium-severity vulnerabilities',
      'Review security configurations',
      'Implement additional security measures',
      'Consider delaying production deployment'
    ];
  } else if (score < 90) {
    return [
      'Address remaining security issues',
      'Implement additional security measures',
      'Monitor for new vulnerabilities',
      'Schedule regular security reviews'
    ];
  } else {
    return [
      'Continue monitoring for new vulnerabilities',
      'Maintain security best practices',
      'Schedule regular security reviews',
      'Consider security certifications'
    ];
  }
}

// =====================================================
// MAIN EXECUTION
// =====================================================

async function main() {
  console.log('🔒 JEWELIA CRM SECURITY AUDIT');
  console.log('='.repeat(60));
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Working Directory: ${process.cwd()}`);
  
  try {
    // Run all security checks
    const results = await Promise.all([
      runDependencyAudit(),
      checkEnvironmentSecurity(),
      checkFilePermissions(),
      checkCodeSecurity(),
      checkInfrastructureSecurity()
    ]);
    
    // Generate comprehensive report
    const report = await generateSecurityReport(results);
    
    // Exit with appropriate code
    if (report.riskLevel === 'CRITICAL') {
      process.exit(1);
    } else if (report.riskLevel === 'HIGH') {
      process.exit(2);
    } else {
      process.exit(0);
    }
    
  } catch (error) {
    logError(`Security audit failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the security audit
if (require.main === module) {
  main().catch(error => {
    logError(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main };
