import puppeteer from 'puppeteer';
import { PuppeteerAgent } from '@midscene/web/puppeteer';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export class PuppeteerAutomationService {
  constructor() {
    this.browser = null;
    this.page = null;
    this.agent = null;
    this.steps = [];
    this.artifacts = [];
    this.onProgress = null; // Callback for progress updates
  }

  async initialize(options = {}) {
    const {
      headless = false,
      viewport = { width: 1280, height: 720 },
      slowMo = 100,
      timeout = 30000
    } = options;

    try {
      // Launch browser
      this.browser = await puppeteer.launch({
        headless,
        slowMo,
        defaultViewport: viewport,
        timeout,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ]
      });

      // Create new page
      this.page = await this.browser.newPage();
      
      // Set default timeout
      this.page.setDefaultTimeout(timeout);
      this.page.setDefaultNavigationTimeout(timeout);

      // Set user agent
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Initialize Midscene agent
      this.agent = new PuppeteerAgent(this.page);

      // Set up page listeners for debugging
      this.page.on('console', msg => {
        console.log(`Browser Console [${msg.type()}]:`, msg.text());
      });

      this.page.on('pageerror', error => {
        console.error('Page Error:', error);
      });

      this.page.on('requestfailed', request => {
        console.warn('Request Failed:', request.url(), request.failure()?.errorText);
      });

      console.log('✅ Puppeteer initialized with Chrome');
      
    } catch (error) {
      console.error('Puppeteer initialization failed:', error);
      throw error;
    }
  }

  async runTask(task) {
    if (!this.agent) {
      throw new Error('Service not initialized. Call initialize() first.');
    }

    const executionStart = Date.now();
    this.steps = [];
    this.artifacts = [];

    try {
      // Take initial screenshot
      await this.captureScreenshot('initial_state');

      // Progress callback
      if (this.onProgress) {
        this.onProgress({
          step: 'Starting automation',
          action: 'initialize',
          timestamp: new Date().toISOString()
        });
      }

      // Execute the main task
      const result = await this.executeTaskWithTracking(task);
      
      // Take final screenshot
      await this.captureScreenshot('final_state');

      // Generate HTML report
      const reportPath = await this.generateReport();

      const duration = Date.now() - executionStart;

      return {
        success: true,
        result,
        duration,
        steps: this.steps,
        artifacts: this.artifacts,
        reportUrl: reportPath
      };

    } catch (error) {
      console.error('Task execution failed:', error);
      
      // Capture error screenshot
      await this.captureScreenshot('error_state');
      
      const duration = Date.now() - executionStart;

      return {
        success: false,
        error: error.message,
        duration,
        steps: this.steps,
        artifacts: this.artifacts
      };
    }
  }

  async executeTaskWithTracking(task) {
    const stepStart = Date.now();
    
    try {
      // Record step start
      const stepId = uuidv4();
      const step = {
        id: stepId,
        stepNumber: this.steps.length + 1,
        actionType: 'aiAction',
        instruction: task,
        startTime: new Date(),
        success: false
      };

      this.steps.push(step);

      // Progress update
      if (this.onProgress) {
        this.onProgress({
          step: `Executing: ${task.substring(0, 100)}${task.length > 100 ? '...' : ''}`,
          action: 'executing',
          stepNumber: step.stepNumber
        });
      }

      // Execute with Midscene
      const result = await this.agent.aiAction(task);

      // Update step
      step.success = true;
      step.endTime = new Date();
      step.durationMs = Date.now() - stepStart;
      step.targetUrl = this.page.url();

      // Capture screenshot after action
      step.screenshotPath = await this.captureScreenshot(`step_${step.stepNumber}`);

      console.log(`✅ Step ${step.stepNumber} completed: ${task}`);

      return result;

    } catch (error) {
      // Update step with error
      const step = this.steps[this.steps.length - 1];
      if (step) {
        step.success = false;
        step.endTime = new Date();
        step.durationMs = Date.now() - stepStart;
        step.errorMessage = error.message;
        step.screenshotPath = await this.captureScreenshot(`step_${step.stepNumber}_error`);
      }

      throw error;
    }
  }

  async captureScreenshot(name) {
    if (!this.page) return null;

    try {
      const artifactsDir = process.env.ARTIFACTS_PATH || './artifacts';
      const screenshotsDir = join(artifactsDir, 'screenshots');
      
      await mkdir(screenshotsDir, { recursive: true });
      
      const filename = `${name}_${Date.now()}.png`;
      const filepath = join(screenshotsDir, filename);
      
      await this.page.screenshot({
        path: filepath,
        fullPage: true,
        quality: 90
      });

      this.artifacts.push({
        id: uuidv4(),
        artifactType: 'screenshot',
        filePath: filepath,
        mimeType: 'image/png',
        description: `Screenshot: ${name}`
      });

      return filepath;

    } catch (error) {
      console.error('Screenshot capture failed:', error);
      return null;
    }
  }

  async generateReport() {
    try {
      const artifactsDir = process.env.ARTIFACTS_PATH || './artifacts';
      const reportsDir = join(artifactsDir, 'reports');
      
      await mkdir(reportsDir, { recursive: true });
      
      const reportFilename = `report_${Date.now()}.html`;
      const reportPath = join(reportsDir, reportFilename);

      const reportHtml = this.createReportHTML();
      await writeFile(reportPath, reportHtml);

      this.artifacts.push({
        id: uuidv4(),
        artifactType: 'html_report',
        filePath: reportPath,
        mimeType: 'text/html',
        description: 'Automation execution report'
      });

      return reportPath;

    } catch (error) {
      console.error('Report generation failed:', error);
      return null;
    }
  }

  createReportHTML() {
    const passedSteps = this.steps.filter(s => s.success).length;
    const totalSteps = this.steps.length;
    const passRate = totalSteps > 0 ? Math.round((passedSteps / totalSteps) * 100) : 0;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Automation Report - Puppeteer</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-value { font-size: 2em; font-weight: bold; color: #3b82f6; }
        .stat-label { color: #6b7280; margin-top: 5px; }
        .steps { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .step { padding: 15px; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; gap: 15px; }
        .step:last-child { border-bottom: none; }
        .step-status { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
        .step-success { background: #10b981; }
        .step-error { background: #ef4444; }
        .step-content { flex: 1; }
        .step-instruction { font-weight: 500; margin-bottom: 5px; }
        .step-meta { color: #6b7280; font-size: 0.9em; }
        .screenshot { max-width: 200px; border-radius: 4px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐶 Puppeteer Automation Report</h1>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Framework:</strong> Puppeteer (Chrome)</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${totalSteps}</div>
                <div class="stat-label">Total Steps</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${passedSteps}</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${totalSteps - passedSteps}</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${passRate}%</div>
                <div class="stat-label">Success Rate</div>
            </div>
        </div>

        <div class="steps">
            <h2 style="margin: 0; padding: 20px; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">Execution Steps</h2>
            ${this.steps.map(step => `
                <div class="step">
                    <div class="step-status ${step.success ? 'step-success' : 'step-error'}">
                        ${step.stepNumber}
                    </div>
                    <div class="step-content">
                        <div class="step-instruction">${step.instruction}</div>
                        <div class="step-meta">
                            Duration: ${step.durationMs || 0}ms | 
                            Status: ${step.success ? 'Success' : 'Failed'} |
                            URL: ${step.targetUrl || 'N/A'}
                            ${step.errorMessage ? `| Error: ${step.errorMessage}` : ''}
                        </div>
                    </div>
                    ${step.screenshotPath ? `<img src="${step.screenshotPath}" class="screenshot" alt="Step ${step.stepNumber} screenshot">` : ''}
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  }

  async cleanup() {
    try {
      if (this.browser) {
        await this.browser.close();
        console.log('✅ Puppeteer browser closed');
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}
