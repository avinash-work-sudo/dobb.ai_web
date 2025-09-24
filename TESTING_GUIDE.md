# 🧪 Testing Guide - AI Test Automation System

## 🚀 Quick Test (2 minutes)

### Step 1: Start the System
```bash
./start.sh
```

### Step 2: Open in Browser
- Frontend: http://localhost:5173
- Backend Health: http://localhost:3001/health

### Step 3: Run a Simple Test
1. Click "Dashboard" in the navigation
2. Select framework: "Playwright" 
3. Enter task: `"Navigate to Google and search for React"`
4. Click "Run with Playwright"
5. Watch the automation execute!

## 🔧 Pre-Test Configuration

### Quick Configuration (Recommended)
```bash
./configure.sh
```
Choose:
- Option 1: OpenAI (if you have API key) 
- Option 3: Mock mode (for testing without AI)
- Option 1: Headed mode (to see browser)

### Manual Configuration
```bash
# For testing without AI requirements
nano backend/.env

# Set these values:
MIDSCENE_MODEL_PROVIDER=mock
MOCK_RESPONSES=true
DEFAULT_HEADLESS=false
```

## 📋 Complete Testing Checklist

### ✅ System Health Tests

1. **Backend Health Check**
```bash
curl http://localhost:3001/health
# Should return JSON with status: "healthy"
```

2. **Frontend Loading**
```bash
# Open http://localhost:5173
# Should see: "DOBB.ai" landing page
```

3. **Navigation Test**
- Click through: Landing → Onboarding → Homepage → Dashboard
- All pages should load without errors

### ✅ Automation Engine Tests

#### Test 1: Basic Navigation
```bash
Task: "Navigate to https://example.com"
Framework: Playwright
Expected: Browser opens, goes to example.com
```

#### Test 2: Search Operation  
```bash
Task: "Go to Google, search for 'automation testing'"
Framework: Playwright
Expected: Opens Google, performs search
```

#### Test 3: Form Interaction
```bash
Task: "Navigate to httpbin.org/forms/post, fill in any text, and submit"
Framework: Playwright
Expected: Fills form and submits
```

### ✅ Framework Comparison Tests

#### Playwright Test
```bash
Task: "Navigate to playwright.dev and click on 'Docs'"
Framework: Playwright
Expected: Successfully navigates and clicks
```

#### Puppeteer Test
```bash
Task: "Navigate to playwright.dev and click on 'Docs'"  
Framework: Puppeteer
Expected: Same result as Playwright
```

### ✅ Error Handling Tests

#### Test Invalid Task
```bash
Task: "Do something impossible that makes no sense"
Expected: Graceful error handling, error message displayed
```

#### Test Network Issues
```bash
Task: "Navigate to https://nonexistent-website-12345.com"
Expected: Timeout error, proper error reporting
```

## 🎯 Example Test Scenarios

### Beginner Tests
```bash
1. "Navigate to Google"
2. "Go to example.com and take a screenshot" 
3. "Open Wikipedia and search for 'artificial intelligence'"
```

### Intermediate Tests
```bash
1. "Navigate to GitHub, go to trending repositories"
2. "Visit news.ycombinator.com and click on the first story"
3. "Go to httpbin.org and test the POST form"
```

### Advanced Tests
```bash
1. "Navigate to an e-commerce demo site, browse products, add item to cart"
2. "Go to a todo app demo, create 3 new tasks, mark one complete"
3. "Visit a form testing site, fill out contact form with sample data"
```

## 🔍 What to Look For

### ✅ Success Indicators
- Browser opens and navigates correctly
- Real-time progress updates in UI
- Screenshots captured at each step
- HTML report generated
- Database stores execution results
- WebSocket updates work

### ❌ Failure Indicators
- Browser doesn't open
- Stuck on "Starting automation..."
- Error messages in console
- No screenshots generated
- WebSocket connection failed

## 🐛 Troubleshooting Common Issues

### Issue: "Backend server failed to start"
```bash
# Check if port is in use
lsof -i :3001

# Kill conflicting processes
sudo kill -9 $(lsof -t -i:3001)

# Check backend logs
cd backend && npm run dev
```

### Issue: "Browser automation fails"
```bash
# Install browser dependencies
cd backend
npx playwright install

# Test browser manually
node -e "const { chromium } = require('playwright'); (async () => { const browser = await chromium.launch({headless: false}); console.log('Browser test OK'); await browser.close(); })()"
```

### Issue: "AI model not responding"
```bash
# Switch to mock mode for testing
# Edit backend/.env:
MIDSCENE_MODEL_PROVIDER=mock
MOCK_RESPONSES=true

# Restart backend
```

### Issue: "WebSocket connection failed"
```bash
# Check browser console for errors
# Verify backend WebSocket server is running
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Key: test" -H "Sec-WebSocket-Version: 13" http://localhost:3001
```

## 📊 Testing Different Configurations

### Test with OpenAI
```bash
# Configure with real API key
MIDSCENE_MODEL_PROVIDER=openai
OPENAI_API_KEY=sk-your-key

# Test complex scenarios
Task: "Navigate to a shopping site, search for laptops, filter by price under $1000, and view the first result"
```

### Test with UI-TARS
```bash
# Start UI-TARS server first
# Configure endpoint
MIDSCENE_MODEL_PROVIDER=ui-tars
UI_TARS_ENDPOINT=http://localhost:8000/v1

# Test UI-specific tasks
Task: "Find the login button and click it"
```

### Test in Headless Mode
```bash
# Edit backend/.env
DEFAULT_HEADLESS=true

# Test performance
# Should execute faster, no browser window
```

## 📈 Performance Testing

### Speed Test
```bash
# Simple navigation test
time curl -X POST http://localhost:3001/api/automation/run \
  -H "Content-Type: application/json" \
  -d '{"task": "Navigate to example.com", "framework": "playwright"}'
```

### Load Test
```bash
# Multiple simultaneous requests (be careful!)
for i in {1..3}; do
  curl -X POST http://localhost:3001/api/automation/run \
    -H "Content-Type: application/json" \
    -d "{\"task\": \"Navigate to httpbin.org/delay/1\", \"framework\": \"playwright\"}" &
done
```

## 🎪 Demo Scenarios

### For Stakeholders
```bash
1. "Navigate to your company website and click 'About Us'"
2. "Go to your competitor's site and take screenshots of their pricing page"
3. "Test your contact form by filling it out with sample data"
```

### For Developers  
```bash
1. "Navigate to localhost:3000 (your dev app) and test the login flow"
2. "Go to your staging environment and verify the new feature works"
3. "Test the checkout process on your e-commerce app"
```

### For QA Teams
```bash
1. "Reproduce bug report: navigate to X, click Y, verify Z appears"
2. "Test responsive design: navigate to page and resize browser window"
3. "Verify form validation: submit form with invalid data and check error messages"
```

## 📋 Test Results Verification

### Check Database
```bash
curl http://localhost:3001/api/test-results
# Should return list of test executions
```

### View Reports
```bash
# HTML reports are generated at:
ls backend/artifacts/reports/

# Screenshots saved at:
ls backend/artifacts/screenshots/
```

### Check Logs
```bash
# Backend logs
tail -f backend/logs/* 2>/dev/null || echo "No log files yet"

# Browser console logs are shown in terminal
```

## 🏆 Success Criteria

Your system is working correctly if:

✅ Both servers start without errors  
✅ Browser automation executes successfully  
✅ Real-time updates appear in UI  
✅ Screenshots are captured and viewable  
✅ HTML reports are generated  
✅ Test results are stored in database  
✅ WebSocket communication works  
✅ Error handling works gracefully  

## 🎯 Next Steps After Testing

1. **Configure production settings**
2. **Add your real API keys** 
3. **Create custom test scenarios**
4. **Integrate with CI/CD pipeline**
5. **Set up monitoring and alerts**

---

**Ready to test? Start with:** `./start.sh` then visit http://localhost:5173! 🚀

