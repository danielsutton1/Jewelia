# BRANCH NAMING CONVENTION
## For Developer: [DEVELOPER-NAME]

## Branch Structure:
- developer/[username]/week1-[task-type]
- developer/[username]/week2-[task-type]
- developer/[username]/bugfix-[issue-number]
- developer/[username]/feature-[feature-name]

## Examples:
- developer/johnsmith/week1-mobile-testing
- developer/johnsmith/week2-api-integration
- developer/johnsmith/bugfix-mobile-menu
- developer/johnsmith/feature-performance-optimization

## Rules:
- Always create from sandbox-development branch
- Never work directly on main branch
- One branch per week/task
- Clear, descriptive names
- Push changes daily

## Creating Your First Branch:
```bash
# 1. Clone the repository
git clone https://github.com/danielsutton1/jewelry-crm-sandbox.git
cd jewelry-crm-sandbox

# 2. Switch to sandbox-development branch
git checkout sandbox-development
git pull origin sandbox-development

# 3. Create your developer branch
git checkout -b developer/[your-username]/week1-mobile-testing

# 4. Push your branch to GitHub
git push -u origin developer/[your-username]/week1-mobile-testing
```

## Daily Workflow:
```bash
# 1. Start each day by pulling latest changes
git checkout sandbox-development
git pull origin sandbox-development

# 2. Switch to your branch
git checkout developer/[your-username]/week1-mobile-testing

# 3. Merge latest changes from sandbox-development
git merge sandbox-development

# 4. Work on your tasks
# ... make changes ...

# 5. Commit your work
git add .
git commit -m "Description of what you changed"

# 6. Push to GitHub
git push origin developer/[your-username]/week1-mobile-testing
```

## Creating Pull Requests:
1. Go to GitHub repository
2. Click "Pull requests" tab
3. Click "New pull request"
4. Select your branch to merge into sandbox-development
5. Add description of changes
6. Request review from repository owner
7. Wait for approval before merging
