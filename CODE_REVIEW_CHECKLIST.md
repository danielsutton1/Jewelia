# 🔍 CODE REVIEW CHECKLIST
## Review every pull request before merging

## 🛠️ TECHNICAL REVIEW
□ Code follows project conventions
□ No hardcoded values or secrets
□ Proper error handling implemented
□ Comments explain complex logic
□ Functions are well-named and focused
□ No unnecessary dependencies added
□ Performance considerations addressed

## 🔒 SECURITY REVIEW
□ No access to sensitive files
□ No hardcoded API keys or passwords
□ No attempts to access production data
□ Input validation implemented
□ No SQL injection vulnerabilities
□ No XSS vulnerabilities
□ Proper authentication checks

## 🎯 FUNCTIONALITY REVIEW
□ Code does what the task requires
□ Edge cases are handled
□ User experience is smooth
□ Mobile responsiveness maintained
□ No breaking changes to existing features
□ Tests pass (if applicable)
□ Performance is acceptable

## 📱 MOBILE REVIEW
□ Works on all screen sizes
□ Touch interactions are smooth
□ Navigation is intuitive
□ Forms are easy to use
□ No horizontal scrolling
□ Loading states are clear
□ Error messages are helpful

## ✅ APPROVAL CRITERIA
- All technical requirements met
- Security review passed
- Functionality works as expected
- Mobile experience is excellent
- Code quality is high
- No breaking changes

## 🚫 REJECTION CRITERIA
- Security violations found
- Poor code quality
- Functionality doesn't work
- Breaking changes introduced
- Unauthorized file access
- Missing required features

## 📝 REVIEW PROCESS

### Step 1: Initial Review
1. Open the pull request
2. Read the description
3. Check the files changed
4. Run the security checklist

### Step 2: Code Examination
1. Go through each file changed
2. Check for security issues
3. Verify functionality
4. Test mobile responsiveness

### Step 3: Testing
1. Pull the branch locally
2. Run the application
3. Test the specific functionality
4. Check for any issues

### Step 4: Decision
- **Approve**: All criteria met
- **Request Changes**: Issues found
- **Comment**: Ask questions or provide feedback

## 💬 FEEDBACK TEMPLATES

### Positive Feedback
```
Great work! The code looks clean and follows our conventions. 
The mobile responsiveness improvements are exactly what we needed.
Ready to merge! ✅
```

### Request Changes
```
Good progress! I found a few issues that need to be addressed:

1. [Issue 1]
2. [Issue 2]
3. [Issue 3]

Please fix these and I'll review again. Thanks!
```

### Security Concern
```
I noticed some potential security issues that need immediate attention:

1. [Security issue 1]
2. [Security issue 2]

Please address these before we can proceed. Security is our top priority.
```

## 📊 REVIEW METRICS

### Code Quality Score
- [ ] Excellent (9-10)
- [ ] Good (7-8)
- [ ] Fair (5-6)
- [ ] Poor (1-4)

### Security Score
- [ ] Excellent (9-10)
- [ ] Good (7-8)
- [ ] Fair (5-6)
- [ ] Poor (1-4)

### Functionality Score
- [ ] Excellent (9-10)
- [ ] Good (7-8)
- [ ] Fair (5-6)
- [ ] Poor (1-4)

### Overall Recommendation
- [ ] Approve and merge
- [ ] Request changes
- [ ] Reject
- [ ] Need more information
