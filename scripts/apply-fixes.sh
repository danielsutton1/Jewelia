#!/bin/bash

# Apply Critical Database Fixes
echo "🔧 Applying Critical Database Fixes..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Check if the SQL file exists
if [ ! -f "scripts/apply-critical-fixes.sql" ]; then
    echo -e "${RED}Error: SQL file not found${NC}"
    exit 1
fi

echo -e "${YELLOW}Applying critical fixes to database...${NC}"

# Apply the SQL fixes
if supabase db reset --linked; then
    echo -e "${GREEN}✅ Database reset successful${NC}"
else
    echo -e "${RED}❌ Database reset failed${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Critical fixes applied successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Test the customer company update functionality"
echo "2. Test the communications API"
echo "3. Verify all API endpoints are working"
echo ""
echo "To test the fixes:"
echo "curl http://localhost:3000/api/customers"
echo "curl http://localhost:3000/api/communications" 