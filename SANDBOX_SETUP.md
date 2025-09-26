# 🏗️ Development Sandbox Setup Guide

## Overview
This guide will help you set up a secure development sandbox for third-party developers while protecting your production code.

## 🎯 Recommended Repository Structure

### Production Repository
- **Main Repo:** `Jeweliacrm/Jewelia-crm` (your production code)
- **Branch:** `main` (production-ready code)

### Development Sandbox
- **Sandbox Repo:** `danielsutton1/jewelry-crm-sandbox`
- **Branch:** `develop` (development branch)
- **Access:** Limited to specific developers

## 🔐 Security Features

### 1. Environment Variables Protection
- Remove sensitive API keys from sandbox
- Use placeholder values for development
- Keep production secrets in main repo only

### 2. Database Access Control
- Use separate Supabase project for sandbox
- Limited database permissions
- No access to production data

### 3. Feature Branching Strategy
- Each developer works on separate feature branches
- Code review required before merging
- Automated testing before deployment

## 📋 Setup Steps

### Step 1: Create Sandbox Repository
```bash
# Create new private repository on GitHub
# Name: jewelry-crm-sandbox
# Description: Development sandbox for Jewelia CRM
# Make it PRIVATE
```

### Step 2: Prepare Code for Sandbox
```bash
# Remove sensitive information
# Update environment variables
# Add development-specific configurations
```

### Step 3: Set Up Access Control
- Add developers as collaborators with limited permissions
- Set up branch protection rules
- Configure required reviews

## 🛠️ Development Workflow

### For Third-Party Developers:
1. Clone sandbox repository
2. Create feature branch: `git checkout -b feature/their-feature-name`
3. Make changes in assigned sections only
4. Submit pull request for review
5. Code review and testing
6. Merge to develop branch

### For You (Project Owner):
1. Review all pull requests
2. Test changes in sandbox environment
3. Merge approved changes to main production repo
4. Deploy to production

## 📁 File Structure for Sandbox

```
jewelry-crm-sandbox/
├── .env.example          # Template for environment variables
├── .env.development      # Development environment variables
├── README.md             # Development setup instructions
├── CONTRIBUTING.md       # Guidelines for developers
├── SECURITY.md           # Security policies
└── [rest of your app code]
```

## 🔒 Security Checklist

- [ ] Remove all production API keys
- [ ] Use development database
- [ ] Remove sensitive configuration
- [ ] Add security headers
- [ ] Set up access logging
- [ ] Configure branch protection
- [ ] Add code review requirements

## 📞 Next Steps

1. Create the GitHub repository
2. Run the setup script
3. Configure access permissions
4. Onboard your developer
5. Set up monitoring and review process

## 🚨 Important Notes

- **NEVER** give developers access to production repository
- **ALWAYS** review code before merging to production
- **REGULARLY** update sandbox with latest production changes
- **MONITOR** all developer activity and changes
