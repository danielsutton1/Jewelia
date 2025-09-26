# 🔒 GITHUB SECURITY SETUP GUIDE
## Complete step-by-step instructions for securing your repository

## STEP 1: REPOSITORY ACCESS CONTROL

### 1.1 Check Current Collaborators
1. Go to: https://github.com/danielsutton1/jewelry-crm-sandbox
2. Click on "Settings" tab
3. Click on "Collaborators" in the left sidebar
4. Take a screenshot of current collaborators
5. Note: You should see only yourself listed

### 1.2 Verify Repository is Private
1. In Settings, look for "Danger Zone" at the bottom
2. Verify "Repository visibility" shows "Private"
3. If not private, click "Change repository visibility" and select "Private"

## STEP 2: BRANCH PROTECTION RULES

### 2.1 Protect Main Branch
1. In Settings, click "Branches" in the left sidebar
2. Click "Add rule"
3. Set branch name pattern to: `main`
4. Check these boxes:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (set to 1)
   - ✅ Dismiss stale PR approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
5. Click "Create"

### 2.2 Protect Sandbox Branch
1. Click "Add rule" again
2. Set branch name pattern to: `sandbox-development`
3. Check these boxes:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (set to 1)
4. Click "Create"

## STEP 3: CREATE DEVELOPER BRANCH

### 3.1 Create Sandbox Development Branch
```bash
cd "/Users/danielsutton/Desktop/Frontend Versions/jewelia-crm-backup-20250806-173139 (2)"
git status
git branch -a
git checkout -b sandbox-development
git push -u origin sandbox-development
```

### 3.2 Verify Branch Creation
1. Go to your GitHub repository
2. Click on "Branches" dropdown
3. Verify you see "sandbox-development" branch
4. Click on it to switch to that branch view

## STEP 4: WEBHOOK SECURITY

### 4.1 Check Webhook Settings
1. In Settings, click "Webhooks" in the left sidebar
2. Review any existing webhooks
3. If you see any suspicious webhooks, delete them
4. Only keep webhooks you recognize (like Vercel, Netlify)

### 4.2 Verify No Unauthorized Access
1. In Settings, click "Security" in the left sidebar
2. Review "Security log" for any suspicious activity
3. Check "Dependabot alerts" for any security issues
4. Review "Code scanning alerts" if any exist

## STEP 5: ADD DEVELOPER AS COLLABORATOR

### 5.1 Add Developer Access
1. In Settings, click "Collaborators" in the left sidebar
2. Click "Add people"
3. Enter developer's GitHub username or email
4. Select "Write" access (not Admin)
5. Click "Add [username] to this repository"

### 5.2 Send Access Instructions
Send this message to your developer:
```
Hi [DEVELOPER-NAME],

I've added you as a collaborator to the Jewelia CRM project.

Repository: https://github.com/danielsutton1/jewelry-crm-sandbox
Access Level: Write (you can create branches and push code)

IMPORTANT RULES:
- Work only in your assigned branch: developer/[your-username]/week1-mobile-testing
- Never push directly to main or sandbox-development branches
- All changes must go through pull requests
- Follow the security guidelines in the repository

Next steps:
1. Clone the repository
2. Create your developer branch
3. Begin working on assigned tasks

Let me know when you're ready to start!
```

## STEP 6: VERIFY SECURITY SETUP

### 6.1 Security Checklist
- [ ] Repository is private
- [ ] Main branch is protected
- [ ] Sandbox branch is protected
- [ ] Developer has Write access only
- [ ] No suspicious webhooks
- [ ] Security log is clean
- [ ] Branch protection rules are active

### 6.2 Test Access Control
1. Ask developer to try pushing to main branch (should fail)
2. Ask developer to create a pull request (should work)
3. Verify you can review and approve their PRs
4. Test that they can only access their assigned branch

## 🚨 EMERGENCY ACCESS REMOVAL

If you need to remove developer access immediately:
1. Go to Settings > Collaborators
2. Find developer's name
3. Click "Remove" next to their name
4. Confirm removal
5. Change your GitHub password
6. Review all their recent commits

## 📞 SUPPORT

If you encounter any issues:
1. Check GitHub's help documentation
2. Contact GitHub support if needed
3. Document any problems for future reference
