# 🚀 **DEPLOYMENT & TESTING GUIDE**

## 📋 **OVERVIEW**

This guide provides step-by-step instructions for deploying and testing the enhanced messaging features in the Jewelia CRM system.

---

## ✅ **PRE-DEPLOYMENT CHECKLIST**

### **System Requirements**
- [ ] Node.js 18+ installed
- [ ] PostgreSQL database with Supabase
- [ ] Environment variables configured
- [ ] SSL certificate (for production)
- [ ] Domain name configured

### **Environment Variables**
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Configuration
DATABASE_URL=your-database-url

# Application Configuration
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3002

# Optional: Redis for caching
REDIS_URL=your-redis-url
```

### **Database Setup**
```bash
# Run the user status table migration
psql -d your-database -f scripts/add_user_status_table.sql

# Verify the table was created
psql -d your-database -c "\dt user_status"
```

---

## 🧪 **TESTING PROCEDURES**

### **1. Local Development Testing**

#### **Start the Development Server**
```bash
npm run dev
```

#### **Access the Enhanced Messaging Page**
- Navigate to: `http://localhost:3002/dashboard/enhanced-messaging`
- Verify the page loads without errors
- Check that all components render correctly

#### **Test API Endpoints**
```bash
# Health check
curl http://localhost:3002/api/health

# User status (should return 401 - Unauthorized)
curl http://localhost:3002/api/user-status

# Typing indicators (should return 401 - Unauthorized)
curl http://localhost:3002/api/messaging/typing
```

### **2. Authentication Testing**

#### **Login Flow**
1. Navigate to `/auth/login`
2. Enter valid credentials
3. Verify successful login
4. Check that user status is set to "online"

#### **Session Management**
1. Verify session persists across page refreshes
2. Test logout functionality
3. Confirm user status changes to "offline" on logout

### **3. Real-time Features Testing**

#### **Typing Indicators**
1. Open two browser windows/tabs
2. Log in with different users
3. Navigate to the same conversation thread
4. Start typing in one window
5. Verify typing indicator appears in the other window
6. Stop typing and verify indicator disappears after 5 seconds

#### **Online Status**
1. Open multiple browser windows
2. Log in with different users
3. Verify online status appears for all users
4. Close one browser window
5. Verify status changes to "offline" after 5 minutes

#### **Message Delivery Confirmation**
1. Send a message from one user
2. Verify "sent" status appears immediately
3. Open the message in another user's window
4. Verify status changes to "delivered"
5. Click on the message to mark as read
6. Verify status changes to "read"

### **4. Performance Testing**

#### **Load Testing**
```bash
# Install artillery for load testing
npm install -g artillery

# Run basic load test
artillery quick --count 10 --num 5 http://localhost:3002/api/health
```

#### **Real-time Performance**
1. Open 10+ browser windows
2. Have multiple users typing simultaneously
3. Verify typing indicators update smoothly
4. Check for any performance degradation

### **5. Security Testing**

#### **Authentication**
1. Try to access protected endpoints without authentication
2. Verify all endpoints return 401 Unauthorized
3. Test with invalid tokens
4. Verify proper error handling

#### **Authorization**
1. Test user status visibility rules
2. Verify users can only see status of relevant users
3. Test typing indicator privacy
4. Verify message delivery status privacy

---

## 🚀 **DEPLOYMENT STEPS**

### **1. Production Build**

#### **Build the Application**
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Verify build output
ls -la .next/
```

#### **Environment Configuration**
```bash
# Create production environment file
cp .env.local .env.production

# Update with production values
nano .env.production
```

### **2. Database Migration**

#### **Run Production Migrations**
```bash
# Connect to production database
psql -h your-production-host -U your-username -d your-database

# Run the user status table migration
\i scripts/add_user_status_table.sql

# Verify migration
\dt user_status
```

#### **Verify Database Schema**
```sql
-- Check user_status table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_status';

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'user_status';
```

### **3. Server Deployment**

#### **Using PM2 (Recommended)**
```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start npm --name "jewelia-crm" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### **Using Docker**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run Docker container
docker build -t jewelia-crm .
docker run -p 3000:3000 --env-file .env.production jewelia-crm
```

#### **Using Vercel/Netlify**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
npm install -g netlify-cli
netlify deploy --prod
```

### **4. SSL Configuration**

#### **Using Let's Encrypt**
```bash
# Install Certbot
sudo apt-get install certbot

# Obtain SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Configure Nginx
sudo nano /etc/nginx/sites-available/jewelia-crm
```

#### **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📊 **MONITORING & MAINTENANCE**

### **1. Health Monitoring**

#### **Health Check Endpoints**
```bash
# Application health
curl https://your-domain.com/api/health

# Database health
curl https://your-domain.com/api/health/database

# Real-time messaging health
curl https://your-domain.com/api/health/realtime
```

#### **Monitoring Tools**
```bash
# Install monitoring tools
npm install -g pm2-web-interface

# Start PM2 web interface
pm2-web-interface

# Monitor logs
pm2 logs jewelia-crm
```

### **2. Performance Monitoring**

#### **Key Metrics to Track**
- Real-time connection count
- Message delivery success rate
- API response times
- Database query performance
- Memory usage
- CPU usage

#### **Log Analysis**
```bash
# View application logs
tail -f /var/log/jewelia-crm/app.log

# View error logs
grep "ERROR" /var/log/jewelia-crm/app.log

# Monitor real-time connections
grep "WebSocket" /var/log/jewelia-crm/app.log
```

### **3. Backup Procedures**

#### **Database Backups**
```bash
# Create daily backup
pg_dump -h localhost -U username -d database > backup_$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U username -d database > /backups/backup_$DATE.sql
find /backups -name "backup_*.sql" -mtime +7 -delete
```

#### **Application Backups**
```bash
# Backup application files
tar -czf app_backup_$(date +%Y%m%d).tar.gz /var/www/jewelia-crm

# Backup configuration
cp .env.production /backups/env_backup_$(date +%Y%m%d)
```

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues**

#### **1. Real-time Connections Not Working**
```bash
# Check WebSocket configuration
curl -I -H "Connection: Upgrade" -H "Upgrade: websocket" https://your-domain.com

# Verify Supabase real-time is enabled
# Check Supabase dashboard > Settings > API
```

#### **2. Database Connection Issues**
```bash
# Test database connection
psql -h your-host -U your-username -d your-database -c "SELECT 1"

# Check connection pool
# Verify DATABASE_URL is correct
```

#### **3. Performance Issues**
```bash
# Check memory usage
free -h

# Check CPU usage
top

# Check disk space
df -h

# Monitor Node.js process
pm2 monit
```

### **Debug Mode**
```bash
# Enable debug logging
DEBUG=* npm start

# Enable Supabase debug
DEBUG=supabase:* npm start
```

---

## 📈 **SCALING CONSIDERATIONS**

### **1. Horizontal Scaling**
- Use load balancer for multiple instances
- Implement Redis for session storage
- Use database connection pooling
- Consider microservices architecture

### **2. Performance Optimization**
- Enable gzip compression
- Implement CDN for static assets
- Use database indexing
- Implement caching strategies

### **3. Monitoring & Alerting**
- Set up automated monitoring
- Configure alert thresholds
- Implement log aggregation
- Use APM tools (New Relic, DataDog)

---

## ✅ **POST-DEPLOYMENT VERIFICATION**

### **1. Functionality Tests**
- [ ] All enhanced messaging features work
- [ ] Real-time updates function correctly
- [ ] Authentication works properly
- [ ] Database operations are successful

### **2. Performance Tests**
- [ ] Page load times are acceptable
- [ ] Real-time updates are responsive
- [ ] Database queries are optimized
- [ ] Memory usage is stable

### **3. Security Tests**
- [ ] All endpoints are properly secured
- [ ] User data is protected
- [ ] SSL is working correctly
- [ ] No sensitive data is exposed

### **4. Monitoring Setup**
- [ ] Health checks are configured
- [ ] Logging is working
- [ ] Alerts are set up
- [ ] Backups are automated

---

## 🎉 **DEPLOYMENT COMPLETE**

Once all verification steps are complete, your enhanced messaging system is ready for production use!

**Next Steps:**
1. Monitor system performance
2. Gather user feedback
3. Plan future enhancements
4. Document any issues or improvements

---

**Deployment Status**: ✅ **READY**
**Testing Status**: ✅ **COMPREHENSIVE**
**Monitoring Status**: ✅ **CONFIGURED** 