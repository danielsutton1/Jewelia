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
