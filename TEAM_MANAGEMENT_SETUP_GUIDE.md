# 🏗️ Team Management System Setup Guide

## **Overview**
This guide will help you set up and use the comprehensive team management system for Jewelia CRM, including the sample team members you requested.

## **🚀 Quick Start**

### **Step 1: Run the Database Setup Script**
1. **Go to your Supabase dashboard**
2. **Click on "SQL Editor" in the left sidebar**
3. **Copy and paste the contents of `scripts/create_team_management_system.sql`**
4. **Click "Run"**

This will create:
- ✅ Enhanced user roles for jewelry industry
- ✅ Business/company management
- ✅ Department structure
- ✅ Team member records
- ✅ Sample users (Michael Jones, Daniel Smith, Eli Martin, Lisa Rodriguez, Renee Lepir)
- ✅ Proper foreign key relationships
- ✅ Row Level Security (RLS) policies

### **Step 2: Access the Team Management System**
Navigate to: `/dashboard/admin/team-management`

## **👥 Sample Team Members Created**

| Name | Role | Department | Email | Specialty |
|------|------|------------|-------|-----------|
| **Michael Jones** | Store Manager | Sales | michael.jones@jewelia.com | Luxury retail experience |
| **Daniel Smith** | Jewelry Designer | Design | daniel.smith@jewelia.com | Modern & vintage styles |
| **Eli Martin** | Gemologist | Quality Control | eli.martin@jewelia.com | Diamond grading & certification |
| **Lisa Rodriguez** | Sales Representative | Sales | lisa.rodriguez@jewelia.com | Customer relationships |
| **Renee Lepir** | Metalsmith | Production | renee.lepir@jewelia.com | Platinum & gold work |

## **🔐 Jewelry-Specific Roles Available**

### **Management Roles**
- **Administrator** - Full system access
- **Manager** - Team and project management
- **Store Manager** - Store operations and sales

### **Sales & Customer Service**
- **Sales Representative** - Customer acquisition
- **Customer Service** - Customer support

### **Creative & Design**
- **Jewelry Designer** - Product design
- **Marketing Specialist** - Brand and promotion

### **Production & Quality**
- **Metalsmith** - Manufacturing
- **Gemologist** - Quality assurance
- **Quality Control** - Standards compliance
- **Repair Technician** - Maintenance

### **Operations**
- **Inventory Specialist** - Stock management
- **Logistics Coordinator** - Supply chain
- **Accountant** - Financial management

## **🏢 Business Structure**

### **Default Business Created**
- **Name**: Jewelia Jewelry Co.
- **Industry**: Jewelry
- **Address**: 123 Jewelry Lane, Diamond District, NY 10001
- **Phone**: +1-555-0123
- **Email**: info@jewelia.com

### **Departments**
1. **Management** - Executive functions
2. **Sales** - Customer acquisition
3. **Design** - Creative development
4. **Production** - Manufacturing
5. **Quality Control** - Standards & compliance

## **⚙️ System Features**

### **Admin Capabilities**
- ✅ **Create new team members** with full profiles
- ✅ **Assign jewelry-specific roles** and permissions
- ✅ **Manage departments** and reporting structure
- ✅ **Set user status** (active/inactive)
- ✅ **Update user information** and roles
- ✅ **Delete users** (with confirmation)

### **User Management**
- ✅ **Comprehensive profiles** with bio, skills, certifications
- ✅ **Role-based permissions** for jewelry industry
- ✅ **Department assignments** and reporting
- ✅ **Hire date tracking** and performance notes
- ✅ **Emergency contact** information
- ✅ **Benefits and salary** management

### **Security Features**
- ✅ **Row Level Security** (RLS) policies
- ✅ **Role-based access control**
- ✅ **Business isolation** (users only see their business data)
- ✅ **Audit logging** for all changes

## **📱 How to Use the Interface**

### **1. View Team Members**
- **List View**: See all team members with search and filters
- **Role Distribution**: Visual breakdown by jewelry role
- **Department Overview**: Team structure by department

### **2. Add New Team Member**
1. Click **"Add Team Member"** button
2. Fill in required fields:
   - Full Name, Email, Password
   - System Role (admin/manager/staff/viewer)
   - Jewelry Role (specific to jewelry industry)
   - Department assignment
   - Hire date and bio
3. Click **"Create User"**

### **3. Edit Team Member**
1. Click the **Edit** button on any user card
2. Modify fields as needed
3. Click **"Update User"**

### **4. Search and Filter**
- **Search**: Find users by name or email
- **Role Filter**: Filter by system role
- **Department Filter**: Filter by department
- **Status Filter**: Show active/inactive users

## **🔧 API Endpoints**

### **Admin User Management**
- `GET /api/admin/users` - List users with filters
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users` - Update user
- `DELETE /api/admin/users` - Delete user

### **Team Management Service**
- User creation and management
- Role and permission assignment
- Department management
- Business relationship handling

## **🔒 Permission System**

### **Role-Based Access**
Each jewelry role has specific permissions:

- **Administrator**: Full access to all features
- **Manager**: Team management, limited user management
- **Sales Representative**: Customer and order access
- **Jewelry Designer**: Production and design access
- **Gemologist**: Quality control and inventory access
- **Metalsmith**: Production workflow access

### **Permission Categories**
- Customer Management
- Order Processing
- Inventory Control
- Production Management
- User Management
- Financial Access
- Reports & Analytics
- System Settings

## **📊 Analytics & Reporting**

### **Business Statistics**
- Total team members
- Active vs. inactive users
- Role distribution
- Department overview
- Recent hires
- Turnover rates

### **Visual Dashboards**
- Role distribution charts
- Department overview cards
- User activity metrics
- Performance indicators

## **🚨 Troubleshooting**

### **Common Issues**

1. **"Unauthorized" Error**
   - Ensure you're logged in as an admin user
   - Check that your user has `admin` role or `admin` jewelry_role

2. **"Insufficient Permissions"**
   - Verify your user has admin access
   - Check the database for proper role assignment

3. **Users Not Loading**
   - Verify the SQL script ran successfully
   - Check browser console for API errors
   - Ensure RLS policies are active

4. **Foreign Key Errors**
   - Run the complete SQL script
   - Check that all tables were created
   - Verify business_id relationships

### **Database Verification**
Run this query in Supabase SQL Editor to verify setup:
```sql
SELECT 
  'users' as table_name,
  COUNT(*) as record_count
FROM users
UNION ALL
SELECT 
  'businesses' as table_name,
  COUNT(*) as record_count
FROM businesses
UNION ALL
SELECT 
  'departments' as table_name,
  COUNT(*) as record_count
FROM departments
UNION ALL
SELECT 
  'team_members' as table_name,
  COUNT(*) as record_count
FROM team_members;
```

## **🎯 Next Steps**

### **Immediate Actions**
1. ✅ Run the database setup script
2. ✅ Access the team management page
3. ✅ Review the sample team members
4. ✅ Test creating a new user

### **Customization Options**
1. **Modify business details** in the businesses table
2. **Add new departments** through the interface
3. **Create custom jewelry roles** if needed
4. **Adjust permission sets** for specific roles

### **Integration Points**
1. **Connect to internal messaging** system
2. **Link with inventory management**
3. **Integrate with production workflows**
4. **Connect to customer management**

## **📞 Support**

If you encounter any issues:
1. Check the browser console for errors
2. Verify database tables exist
3. Ensure proper user authentication
4. Check RLS policies are active

The system is designed to be robust and user-friendly, with comprehensive error handling and clear feedback for all operations.

