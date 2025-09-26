# 🚀 **SUPABASE SETUP GUIDE FOR JEWELIA CRM**

## 🎯 **Goal**
Set up a real Supabase backend to replace the mock client and enable full functionality for internal messaging, user management, and data persistence.

---

## 📋 **PREREQUISITES**

- ✅ **Supabase Account** - Sign up at https://supabase.com
- ✅ **Vercel Project** - Your Jewelia CRM deployment
- ✅ **GitHub Repository** - Your project code

---

## 🔧 **STEP 1: CREATE SUPABASE PROJECT**

### **1.1 Create New Project**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Choose your organization
4. Enter project details:
   - **Name**: `jewelia-crm` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click **"Create new project"**

### **1.2 Wait for Setup**
- Project creation takes 2-5 minutes
- You'll see "Project is ready" when complete

---

## 🔑 **STEP 2: GET CREDENTIALS**

### **2.1 Access API Settings**
1. In your Supabase project dashboard
2. Go to **Settings** → **API**
3. Copy these values:

```
Project URL: https://abcdefghijklmnop.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **2.2 Save Credentials Securely**
- Store these in a password manager
- Never commit them to Git
- You'll need them for Vercel environment variables

---

## 🗄️ **STEP 3: SET UP DATABASE**

### **3.1 Access SQL Editor**
1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**

### **3.2 Run Migration Script**
1. Copy the entire content from `supabase/migrations/20250101000000_create_internal_messaging_tables.sql`
2. Paste into SQL Editor
3. Click **"Run"**

### **3.3 Verify Tables Created**
1. Go to **Table Editor**
2. You should see these tables:
   - `internal_messages`
   - `message_threads`
   - `message_attachments`
   - `message_notifications`

---

## 🌐 **STEP 4: CONFIGURE VERCEL**

### **4.1 Add Environment Variables**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **Jewelia CRM** project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### **4.2 Redeploy Project**
1. Go to **Deployments** tab
2. Click **"Redeploy"** on your latest deployment
3. Wait for deployment to complete (2-5 minutes)

---

## 🧪 **STEP 5: TEST FUNCTIONALITY**

### **5.1 Test Demo Login**
1. Visit your Vercel deployment
2. Click **"🚀 Try Demo"**
3. Should redirect to dashboard successfully

### **5.2 Test Internal Messages**
1. Go to **Internal Messages** section
2. Try to send a message
3. Check if it appears in the list
4. Refresh page - message should persist

### **5.3 Check Console Logs**
Should see:
```
✅ Creating real Supabase client with environment variables
✅ User authenticated with role: admin
```

---

## 🔍 **STEP 6: TROUBLESHOOTING**

### **Common Issues & Solutions**

#### **Issue: Still Getting Mock Client**
**Solution**: 
- Verify environment variables are set correctly in Vercel
- Check variable names match exactly
- Redeploy after adding variables

#### **Issue: Database Connection Errors**
**Solution**:
- Verify Supabase project is active
- Check credentials are correct
- Ensure database tables exist

#### **Issue: Authentication Failing**
**Solution**:
- Check RLS policies in Supabase
- Verify user permissions
- Check auth configuration

---

## 📊 **STEP 7: VERIFY SETUP**

### **7.1 Check Supabase Dashboard**
- **Authentication** → Users should show demo user
- **Table Editor** → Messages should appear
- **Logs** → API calls should be visible

### **7.2 Test Full Workflow**
1. **Login** → Demo user authentication
2. **Send Message** → Create internal message
3. **View Messages** → List should show sent message
4. **Refresh Page** → Data should persist
5. **Check Database** → Message should be in Supabase

---

## 🚀 **STEP 8: ADVANCED CONFIGURATION**

### **8.1 Enable Row Level Security (Optional)**
```sql
-- In Supabase SQL Editor
ALTER TABLE internal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
```

### **8.2 Set Up Storage (Optional)**
1. Go to **Storage** in Supabase
2. Create bucket: `message-attachments`
3. Set permissions for authenticated users

### **8.3 Configure Email (Optional)**
1. Go to **Authentication** → **Settings**
2. Configure SMTP settings
3. Enable email confirmations

---

## ✅ **SUCCESS INDICATORS**

- ✅ **Demo login works** without glitching
- ✅ **Messages persist** after page refresh
- ✅ **API calls succeed** (no more 500 errors)
- ✅ **Console shows real client** (not mock)
- ✅ **Database tables populated** with data
- ✅ **No more "Multiple GoTrueClient" warnings**

---

## 📞 **SUPPORT**

### **If Setup Fails:**
1. Check Vercel deployment logs
2. Verify Supabase project status
3. Confirm environment variables
4. Check database table creation

### **Resources:**
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Next.js Supabase Integration](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

---

## 🎯 **NEXT STEPS AFTER SETUP**

1. **Test all messaging features**
2. **Set up user management**
3. **Configure notifications**
4. **Add file uploads**
5. **Set up real-time updates**

---

**Status**: 🟡 **READY FOR SETUP**  
**Estimated Time**: 15-30 minutes  
**Difficulty**: 🟢 **BEGINNER**  
**Priority**: 🔴 **HIGH** - Required for full functionality
