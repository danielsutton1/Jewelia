#!/bin/bash

# 🏗️ Sandbox Preparation Script
# This script prepares your production code for a development sandbox

echo "🚀 Preparing code for development sandbox..."

# Create backup of current state
echo "📦 Creating backup..."
cp -r . ../jewelia-crm-production-backup-$(date +%Y%m%d-%H%M%S)

# Create .env.example file
echo "🔐 Creating environment template..."
cat > .env.example << 'EOF'
# Development Environment Variables
# Copy this file to .env.local and fill in your values

# Supabase Configuration (Development)
NEXT_PUBLIC_SUPABASE_URL=your_development_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_development_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_development_service_role_key

# Database Configuration
DATABASE_URL=your_development_database_url

# Authentication
NEXTAUTH_SECRET=your_development_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Email Configuration (Development)
SMTP_HOST=your_development_smtp_host
SMTP_PORT=587
SMTP_USER=your_development_smtp_user
SMTP_PASS=your_development_smtp_password

# External APIs (Development)
OPENAI_API_KEY=your_development_openai_key
STRIPE_SECRET_KEY=your_development_stripe_key
STRIPE_PUBLISHABLE_KEY=your_development_stripe_publishable_key

# Development Flags
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
EOF

# Create .env.development file
echo "🔧 Creating development environment file..."
cat > .env.development << 'EOF'
# Development Environment Variables
# This file contains development-specific configurations

NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_LOG_LEVEL=debug

# Use development database
NEXT_PUBLIC_SUPABASE_URL=your_development_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_development_supabase_anon_key

# Development API endpoints
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
EOF

# Create CONTRIBUTING.md
echo "📝 Creating contribution guidelines..."
cat > CONTRIBUTING.md << 'EOF'
# 🤝 Contributing to Jewelia CRM

## Development Guidelines

### Getting Started
1. Clone this repository
2. Copy `.env.example` to `.env.local`
3. Fill in your development environment variables
4. Run `pnpm install`
5. Run `pnpm dev`

### Code Standards
- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Write tests for new features
- Follow the existing code style

### Branch Naming
- `feature/your-feature-name` - New features
- `fix/your-fix-description` - Bug fixes
- `refactor/your-refactor-description` - Code refactoring

### Pull Request Process
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request
5. Address any review feedback
6. Wait for approval before merging

### Security
- Never commit sensitive information
- Use environment variables for configuration
- Follow security best practices
- Report security issues privately

### Questions?
Contact the project maintainer for any questions or clarifications.
EOF

# Create SECURITY.md
echo "🔒 Creating security guidelines..."
cat > SECURITY.md << 'EOF'
# 🔐 Security Policy

## Reporting Security Issues

If you discover a security vulnerability, please report it privately:

1. **DO NOT** create a public issue
2. Contact the project maintainer directly
3. Provide detailed information about the vulnerability
4. Wait for confirmation before disclosing publicly

## Security Guidelines

### For Developers
- Never commit API keys or secrets
- Use environment variables for sensitive data
- Follow secure coding practices
- Keep dependencies updated
- Validate all user inputs

### For Code Review
- Review all code changes carefully
- Check for security vulnerabilities
- Verify no sensitive data is exposed
- Ensure proper error handling

## Security Features

- Environment variable protection
- Input validation and sanitization
- Secure authentication
- Protected API endpoints
- Regular security updates

## Contact

For security-related questions or reports, contact the project maintainer.
EOF

# Remove sensitive files
echo "🧹 Removing sensitive files..."
rm -f .env.local
rm -f .env.production
rm -f .env

# Create gitignore for sandbox
echo "📋 Creating sandbox-specific gitignore..."
cat >> .gitignore << 'EOF'

# Sandbox-specific ignores
.env.local
.env.development
.env.production
*.log
.DS_Store
node_modules/
.next/
dist/
build/
EOF

# Create README for sandbox
echo "📖 Creating sandbox README..."
cat > README.md << 'EOF'
# 🏗️ Jewelia CRM - Development Sandbox

This is a development sandbox for the Jewelia CRM application. This repository contains a copy of the production code for development and testing purposes.

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/danielsutton1/jewelry-crm-sandbox.git
   cd jewelry-crm-sandbox
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your development values
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

- `app/` - Next.js application pages and components
- `components/` - Reusable React components
- `lib/` - Utility functions and services
- `public/` - Static assets
- `scripts/` - Database and setup scripts

## 🔧 Development

### Available Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking

### Database Setup
1. Set up your development Supabase project
2. Update environment variables
3. Run database migration scripts in `scripts/` folder

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## 🔐 Security

Please read [SECURITY.md](SECURITY.md) for security guidelines.

## 📞 Support

For questions or support, contact the project maintainer.

---

**Note:** This is a development sandbox. Do not use production credentials or data.
EOF

echo "✅ Sandbox preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create a new private repository on GitHub: jewelry-crm-sandbox"
echo "2. Add this repository as a remote: git remote add sandbox https://github.com/danielsutton1/jewelry-crm-sandbox.git"
echo "3. Push the code: git push sandbox messaging-system-fixes"
echo "4. Set up branch protection and access controls"
echo "5. Add your developer as a collaborator"
echo ""
echo "🔒 Remember to:"
echo "- Use development database credentials"
echo "- Remove any production API keys"
echo "- Set up proper access controls"
echo "- Monitor all developer activity"
