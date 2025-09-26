# Development Workflow Checklist

This document provides a step-by-step workflow for developing, testing, and deploying the project. Follow these steps before every deployment to ensure a smooth CI/CD process and successful Netlify builds.

---

## 1. Local Development Setup

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd <your-project-directory>
   ```
2. **Install dependencies:**
   ```sh
   npm ci
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env.local` (if available), or create `.env.local` manually.
   - Add all required environment variables (see section 5 below).
4. **Start the development server:**
   ```sh
   npm run dev
   ```
5. **Access the app:**
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. How to Test Production Build Locally

1. **Build the app:**
   ```sh
   npm run build
   ```
2. **Start the production server:**
   ```sh
   npm run preview
   ```
3. **Verify:**
   - Visit [http://localhost:3000](http://localhost:3000) and check for any issues.
   - Test all critical flows as a user would.

---

## 3. Pre-Push Checklist

Before pushing code to GitHub, always:

- [ ] **Lint:**
  ```sh
  npm run lint
  ```
- [ ] **Type Check:**
  ```sh
  npm run type-check
  ```
- [ ] **Build:**
  ```sh
  npm run build
  ```
- [ ] **Run Unit Tests:**
  ```sh
  npm test
  ```
- [ ] **Test Production Build Locally:**
  ```sh
  npm run preview
  # Then visit http://localhost:3000
  ```
- [ ] **Check Environment Variables:**
  - Ensure `.env.local` is up to date and not committed to git.
  - Confirm all required variables are set (see section 5).

---

## 4. How to Debug Common Build Errors

- **TypeScript errors:**
  - Run `npm run type-check` and fix any reported issues.
- **Lint errors:**
  - Run `npm run lint` and address all errors (warnings should be reviewed but may not block build).
- **Missing environment variables:**
  - Check `.env.local` and ensure all required variables are present and correct.
- **Module not found / import errors:**
  - Double-check import paths and ensure all dependencies are installed.
- **Next.js build errors:**
  - Run `npm run build` and read the error output carefully.
  - Search the error message in the Next.js docs or GitHub issues if unclear.
- **Production-only issues:**
  - Always test with `npm run build` and `npm run preview`—some issues only appear in production mode.
- **CI/CD failures:**
  - Check the GitHub Actions logs for details.
  - Reproduce the failing step locally using the same commands.

---

## 5. Environment Variable Management

- **Local development:**
  - Use a `.env.local` file in the project root.
  - Example variables:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
    # Add any other variables required by your app
    ```
  - **Never commit `.env.local` to git!**
- **Netlify deployment:**
  - Set the same variables in the Netlify dashboard under Site Settings > Environment Variables.
- **GitHub Actions:**
  - Add the same variables as repository secrets (Settings > Secrets and variables > Actions).
  - The workflow will use these secrets for build and test tasks.

---

## Quick Reference

- **Start dev server:** `npm run dev`
- **Lint:** `npm run lint`
- **Type check:** `npm run type-check`
- **Build:** `npm run build`
- **Preview production build:** `npm run preview`
- **Run tests:** `npm test`

---

_Keep this checklist up to date as your project evolves!_ 