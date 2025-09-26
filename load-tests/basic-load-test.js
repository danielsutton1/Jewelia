// =====================================================
// BASIC LOAD TEST SCRIPT
// =====================================================
// This script validates the load testing configuration
// without requiring a live server

const fs = require('fs');
const path = require('path');

console.log('🧪 BASIC LOAD TEST VALIDATION');
console.log('='.repeat(50));

// Check if Artillery configuration exists
const artilleryConfigPath = path.join(__dirname, 'artillery-config.yml');
if (fs.existsSync(artilleryConfigPath)) {
  console.log('✅ Artillery configuration file found');
  
  // Read and validate the configuration
  const config = fs.readFileSync(artilleryConfigPath, 'utf8');
  
  // Check for required sections
  const hasConfig = config.includes('config:');
  const hasScenarios = config.includes('scenarios:');
  const hasTarget = config.includes('target:');
  
  console.log(`✅ Config section: ${hasConfig ? 'Found' : 'Missing'}`);
  console.log(`✅ Scenarios section: ${hasScenarios ? 'Found' : 'Missing'}`);
  console.log(`✅ Target configuration: ${hasTarget ? 'Found' : 'Missing'}`);
  
  // Count scenarios
  const scenarioCount = (config.match(/- name:/g) || []).length;
  console.log(`✅ Scenarios found: ${scenarioCount}`);
  
  // Check for different test types
  const testTypes = [];
  if (config.includes('Messaging API Load Test')) testTypes.push('Messaging');
  if (config.includes('Networking API Load Test')) testTypes.push('Networking');
  if (config.includes('Authentication Load Test')) testTypes.push('Authentication');
  if (config.includes('Real-time Messaging Load Test')) testTypes.push('Real-time');
  if (config.includes('Push Notification Load Test')) testTypes.push('Push Notifications');
  
  console.log(`✅ Test types configured: ${testTypes.join(', ')}`);
  
  // Check for performance thresholds
  const hasPhases = config.includes('phases:');
  const hasWarmUp = config.includes('Warm up');
  const hasSustainedLoad = config.includes('Sustained load');
  const hasPeakLoad = config.includes('Peak load');
  
  console.log(`✅ Load phases: ${hasPhases ? 'Configured' : 'Missing'}`);
  console.log(`✅ Warm-up phase: ${hasWarmUp ? 'Found' : 'Missing'}`);
  console.log(`✅ Sustained load: ${hasSustainedLoad ? 'Found' : 'Missing'}`);
  console.log(`✅ Peak load: ${hasPeakLoad ? 'Found' : 'Missing'}`);
  
  // Check for security tests
  const hasSecurityTests = config.includes('Security Load Test');
  console.log(`✅ Security tests: ${hasSecurityTests ? 'Included' : 'Missing'}`);
  
  // Check for real-time tests
  const hasWebSocketTests = config.includes('websocket:');
  console.log(`✅ WebSocket tests: ${hasWebSocketTests ? 'Included' : 'Missing'}`);
  
  // Check for custom functions
  const hasCustomFunctions = config.includes('functions:');
  console.log(`✅ Custom functions: ${hasCustomFunctions ? 'Included' : 'Missing'}`);
  
  // Check for environment configurations
  const hasEnvironments = config.includes('environments:');
  const hasDevelopment = config.includes('development:');
  const hasStaging = config.includes('staging:');
  const hasProduction = config.includes('production:');
  
  console.log(`✅ Environment configs: ${hasEnvironments ? 'Included' : 'Missing'}`);
  console.log(`✅ Development config: ${hasDevelopment ? 'Found' : 'Missing'}`);
  console.log(`✅ Staging config: ${hasStaging ? 'Found' : 'Missing'}`);
  console.log(`✅ Production config: ${hasProduction ? 'Found' : 'Missing'}`);
  
  // Check for plugins
  const hasPlugins = config.includes('plugins:');
  const hasExpect = config.includes('expect:');
  const hasMetrics = config.includes('metrics-by-endpoint:');
  
  console.log(`✅ Plugin system: ${hasPlugins ? 'Configured' : 'Missing'}`);
  console.log(`✅ Expect plugin: ${hasExpect ? 'Included' : 'Missing'}`);
  console.log(`✅ Metrics plugin: ${hasMetrics ? 'Included' : 'Missing'}`);
  
  console.log('\n📊 LOAD TEST CONFIGURATION SUMMARY');
  console.log('─'.repeat(40));
  
  const totalChecks = 20;
  const passedChecks = [
    hasConfig, hasScenarios, hasTarget, scenarioCount > 0,
    testTypes.length > 0, hasPhases, hasWarmUp, hasSustainedLoad,
    hasPeakLoad, hasSecurityTests, hasWebSocketTests, hasCustomFunctions,
    hasEnvironments, hasDevelopment, hasStaging, hasProduction,
    hasPlugins, hasExpect, hasMetrics
  ].filter(Boolean).length;
  
  const score = Math.round((passedChecks / totalChecks) * 100);
  console.log(`Configuration Score: ${score}% (${passedChecks}/${totalChecks})`);
  
  if (score >= 90) {
    console.log('🎉 EXCELLENT: Load test configuration is production-ready!');
  } else if (score >= 75) {
    console.log('✅ GOOD: Load test configuration is well-configured');
  } else if (score >= 60) {
    console.log('⚠️  FAIR: Load test configuration needs some improvements');
  } else {
    console.log('❌ POOR: Load test configuration needs significant work');
  }
  
  console.log('\n🚀 READY FOR LOAD TESTING');
  console.log('─'.repeat(40));
  console.log('To run load tests against a live server:');
  console.log('1. Start your development server: npm run dev');
  console.log('2. Run load test: npm run test:load');
  console.log('3. For production: Update target URL in artillery-config.yml');
  console.log('4. Run production load test: artillery run load-tests/artillery-config.yml');
  
} else {
  console.log('❌ Artillery configuration file not found');
  console.log('Please create load-tests/artillery-config.yml first');
}

console.log('\n' + '='.repeat(50));
console.log('Basic load test validation completed');
