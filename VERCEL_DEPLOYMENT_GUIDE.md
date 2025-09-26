# Vercel Deployment Guide for Jewelia CRM

## 🚀 Deployment Configuration

This guide explains the configuration changes made to resolve Vercel deployment issues.

## 📋 Changes Made

### 1. **vercel.json Updates**
- Added build environment variables
- Configured function timeouts
- Set specific region (iad1 - Washington, D.C.)
- Enhanced install command with retry logic

### 2. **Configuration Files**
- `.npmrc` - NPM registry and timeout configuration
- `.pnpmrc` - PNPM-specific configuration
- Enhanced `.vercelignore` for better build optimization

### 3. **Build Scripts**
- `scripts/vercel-build.sh` - Custom build script with retry logic
- Added `build:vercel` script to package.json

## 🔧 Key Configuration Details

### Timeout Settings
- **Fetch Timeout**: 300 seconds (5 minutes)
- **Network Timeout**: 300 seconds
- **Retry Attempts**: 5 attempts
- **Retry Delays**: 10-60 seconds between attempts

### Registry Configuration
- **Primary Registry**: https://registry.npmjs.org/
- **Fallback Registries**: Configured for all scoped packages
- **Offline Preference**: Enabled for faster builds

## 🚨 Common Issues & Solutions

### Issue: ETIMEDOUT Errors
**Solution**: The configuration now includes:
- Extended timeouts (5 minutes)
- Retry logic with exponential backoff
- Multiple registry fallbacks

### Issue: Package Manager Switching
**Solution**: 
- Locked to pnpm@10.0.0
- Added `packageManager` field in package.json
- Consistent install commands

### Issue: Large Dependency Tree
**Solution**:
- Enhanced `.vercelignore` to exclude unnecessary files
- Optimized build process
- Better caching configuration

## 📦 Deployment Commands

### Standard Deployment
```bash
vercel --prod
```

### Force Redeploy
```bash
vercel --prod --force
```

### Local Build Test
```bash
pnpm run build:vercel
```

## 🔍 Troubleshooting Steps

### 1. **Check Build Logs**
- Monitor the build process in Vercel dashboard
- Look for specific timeout errors
- Check package installation progress

### 2. **Verify Configuration**
- Ensure `.npmrc` and `.pnpmrc` are committed
- Verify `vercel.json` settings
- Check package.json scripts

### 3. **Registry Issues**
- If npm registry is down, wait and retry
- Check Vercel status page for known issues
- Consider using alternative registries temporarily

### 4. **Dependency Issues**
- Clear Vercel build cache
- Update lockfile if needed
- Verify all dependencies are available

## 🎯 Best Practices

### 1. **Lockfile Management**
- Always commit `pnpm-lock.yaml`
- Use `--frozen-lockfile` for consistent builds
- Avoid `latest` versions in production

### 2. **Build Optimization**
- Exclude test files and documentation
- Minimize build artifacts
- Use appropriate Node.js version

### 3. **Monitoring**
- Set up build notifications
- Monitor build times and success rates
- Track dependency updates

## 📞 Support

If deployment issues persist:

1. **Check Vercel Status**: https://status.vercel.com/
2. **Review Build Logs**: Detailed error information
3. **Verify Dependencies**: Ensure all packages are available
4. **Contact Support**: Vercel support for platform issues

## 🔄 Rollback Strategy

If a deployment fails:

1. **Immediate Rollback**: Use Vercel dashboard
2. **Investigate**: Check logs and configuration
3. **Fix Issues**: Apply necessary changes
4. **Redeploy**: Test with fixes applied

---

**Last Updated**: $(date)
**Version**: 1.0.0
**Maintainer**: Development Team
