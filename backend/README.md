# Weave & Know Backend - AI Test Automation API

A powerful backend service for AI-driven web automation using Midscene.js with Playwright and Puppeteer.

## 🚀 Features

- **Natural Language Automation**: Execute complex web tasks using plain English
- **Multi-Framework Support**: Choose between Playwright and Puppeteer
- **Real-time Updates**: WebSocket support for live automation progress
- **Comprehensive Reporting**: Visual HTML reports with screenshots
- **Test Result Storage**: SQLite database for persistent test data
- **Artifact Management**: Automatic storage and serving of screenshots, reports, and logs
- **RESTful API**: Clean, well-documented endpoints

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Chrome/Chromium browser (for Puppeteer)
- Firefox, Safari (optional, for Playwright)

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start the server:**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 🔧 Configuration

Create a `.env` file in the backend directory:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Midscene Configuration
MIDSCENE_MODEL_PROVIDER=ui-tars
MIDSCENE_MODEL_ENDPOINT=your-ui-tars-endpoint
OPENAI_API_KEY=your-openai-key-if-using-openai

# Browser Configuration
DEFAULT_HEADLESS=false
BROWSER_TIMEOUT=30000

# Storage Configuration
ARTIFACTS_PATH=./artifacts
DATABASE_PATH=./database/test-results.db
```

## 📡 API Endpoints

### Automation

- `POST /api/automation/run` - Start automation
- `GET /api/automation/status/:executionId` - Get execution status
- `POST /api/automation/stop/:executionId` - Stop automation
- `GET /api/automation/frameworks` - List available frameworks

### Test Results

- `GET /api/test-results` - List test executions
- `GET /api/test-results/:executionId` - Get detailed results
- `GET /api/test-results/statistics` - Get test statistics
- `DELETE /api/test-results/:executionId` - Delete execution

### Artifacts

- `GET /api/artifacts/:executionId/report` - View HTML report
- `GET /api/artifacts/:executionId/screenshots` - List screenshots
- `GET /api/artifacts/:executionId/:artifactType` - Download artifact

## 🎯 Usage Examples

### Start an Automation

```javascript
const response = await fetch('http://localhost:3001/api/automation/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    task: "Navigate to Google, search for 'React testing', and click the first result",
    framework: 'playwright',
    options: {
      headless: false,
      viewport: { width: 1280, height: 720 }
    }
  })
});

const result = await response.json();
console.log('Execution ID:', result.executionId);
```

### Check Status

```javascript
const response = await fetch(`http://localhost:3001/api/automation/status/${executionId}`);
const status = await response.json();
console.log('Status:', status.execution.status);
```

### WebSocket Updates

```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'automation_update') {
    console.log('Progress:', data.step);
  }
};

// Subscribe to updates
ws.send(JSON.stringify({
  type: 'subscribe_to_automation',
  automationId: executionId
}));
```

## 🎭 Frameworks

### Playwright
- **Multi-browser**: Chrome, Firefox, Safari, Edge
- **Mobile testing**: Device emulation
- **Network interception**: Mock APIs, control cache
- **Auto-wait**: Automatic element waiting
- **Better debugging**: Enhanced dev tools

### Puppeteer  
- **Chrome focus**: Optimized for Chromium
- **PDF generation**: Native PDF support
- **Performance profiling**: Chrome DevTools access
- **Lightweight**: Smaller bundle size

## 📊 Natural Language Examples

```javascript
// E-commerce workflow
"Login with test credentials, navigate to products, add a laptop to cart, and proceed to checkout"

// Content management
"Go to admin panel, create a new blog post with title 'Test Post', add content, and publish"

// Social media
"Login to Twitter, create a new tweet with text 'Hello World!', and add a hashtag #automation"

// Data extraction
"Navigate to news website, find the latest technology article, and extract the headline and summary"
```

## 🗄️ Database Schema

The backend uses SQLite with the following main tables:

- `test_executions` - Main execution records
- `test_steps` - Individual automation steps
- `test_artifacts` - Screenshots, reports, logs
- `test_requirements` - Traceability mapping

## 📁 Project Structure

```
backend/
├── src/
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic
│   ├── database/         # Database setup and migrations
│   └── server.js         # Main server file
├── artifacts/            # Generated files (screenshots, reports)
├── database/            # SQLite database files
└── package.json
```

## 🚦 Health Check

The server provides a health check endpoint:

```bash
curl http://localhost:3001/health
```

Returns server status, version, and configuration info.

## 🔍 Debugging

- **Browser Console**: Page console logs are forwarded to server logs
- **Screenshots**: Automatic capture on each step and errors
- **Visual Reports**: Interactive HTML reports with step details
- **WebSocket Logs**: Real-time automation progress

## 🔧 Troubleshooting

### Common Issues

1. **Browser not found**: Ensure Chrome is installed for Puppeteer
2. **Permission denied**: Check file permissions for artifacts directory
3. **Port in use**: Change PORT in .env file
4. **WebSocket connection failed**: Check firewall settings

### Browser Installation

```bash
# Install browsers for Playwright
npx playwright install

# Verify Puppeteer Chrome
node -e "console.log(require('puppeteer').executablePath())"
```

## 📈 Performance Tips

- Use `headless: true` for faster execution in CI/CD
- Limit `slowMo` for production runs
- Clean up old artifacts regularly
- Use appropriate timeouts for your use case

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
