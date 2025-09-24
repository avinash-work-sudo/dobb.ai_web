import { chromium, firefox, webkit } from 'playwright';
import { PlaywrightAgent } from '@midscene/web/playwright';
import { mkdir, writeFile, readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export class PlaywrightAutomationService {
  constructor() {
    this.browser = null;
    this.page = null;
    this.agent = null;
    this.executionId = null;
    this.steps = [];
    this.artifacts = [];
    this.onProgress = null; // Callback for progress updates
  }

  async initialize(options = {}) {
    const {
      browserType = 'chromium',
      headless = false,
      viewport = { width: 1280, height: 720 },
      slowMo = 100,
      timeout = 30000
    } = options;

    try {
      // Choose browser
      const browserEngine = browserType === 'firefox' ? firefox :
                           browserType === 'webkit' ? webkit :
                           chromium;

      // Launch browser
      this.browser = await browserEngine.launch({
        headless,
        slowMo,
        timeout,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });

      // Create context and page
      const context = await this.browser.newContext({
        viewport,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });

      this.page = await context.newPage();
      
      // Set default timeout
      this.page.setDefaultTimeout(timeout);
      this.page.setDefaultNavigationTimeout(timeout);

      // Initialize Midscene agent
      this.agent = new PlaywrightAgent(this.page);

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

      console.log(`✅ Playwright initialized with ${browserType}`);
      
    } catch (error) {
      console.error('Playwright initialization failed:', error);
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
    let executionResult;

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

      // Pre-process task for direct navigation if needed
      const preprocessedTask = await this.preprocessTask(task);
      
      // Execute the main task
      const result = await this.executeTaskWithTracking(preprocessedTask);
      
      // Take final screenshot
      await this.captureScreenshot('final_state');

      // Generate HTML report
      const reportPath = await this.generateReport();

      const duration = Date.now() - executionStart;

      executionResult = {
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

      executionResult = {
        success: false,
        error: error.message,
        duration,
        steps: this.steps,
        artifacts: this.artifacts
      };
    } finally {
      try {
        await this.customizeAgentReportBranding();
      } catch (brandingError) {
        console.warn('Branding customization skipped:', brandingError.message);
      }
    }

    return executionResult;
  }

  async preprocessTask(task) {
    // First, check if this is a complex e-commerce task that needs decomposition
    const ecommercePattern = /(?:goto|go to|visit)\s+([a-zA-Z0-9.-]+).*(?:and\s+)?(?:add|buy|purchase|find)\s+(?:a\s+)?([a-zA-Z0-9\s-]+?)\s+(?:to\s+)?(?:my\s+)?(?:cart|basket)/i;
    const ecommerceMatch = task.match(ecommercePattern);
    
    if (ecommerceMatch) {
      const site = ecommerceMatch[1];
      const product = ecommerceMatch[2].trim();
      
      console.log(`🛒 E-commerce task detected: ${site} + ${product}`);
      console.log(`🔄 Decomposing into search + add to cart workflow`);
      
      // Return a more detailed, step-by-step task
      return `First navigate to ${site}, then search for "${product}", then click on a suitable product result, and finally add it to cart`;
    }
    
    // Check if the task involves navigating to a specific URL or common site names
    // Also handle decomposed tasks that start with "First navigate to..."
    const urlPattern = /(?:^|First\s+|Then\s+)?(?:navigate to|go to|goto|visit|open)\s*([a-zA-Z0-9.-]+(?:\.[a-zA-Z]{2,})?(?:\/\S*)?)/i;
    const match = task.match(urlPattern);
    
    if (match) {
      let url = match[1];
      
      // Common site names mapping
      const commonSites = {
        'flipkart': 'flipkart.com',
        'amazon': 'amazon.com', 
        'google': 'google.com',
        'youtube': 'youtube.com',
        'facebook': 'facebook.com',
        'twitter': 'twitter.com',
        'github': 'github.com',
        'linkedin': 'linkedin.com'
      };
      
      // Check if it's a common site name without domain
      if (commonSites[url.toLowerCase()]) {
        url = commonSites[url.toLowerCase()];
      }
      
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      console.log(`🔗 Direct navigation detected: ${url}`);
      console.log(`📍 Current page URL before navigation: ${this.page.url()}`);
      
      try {
        console.log(`⏳ Attempting to navigate to: ${url}`);
        await this.page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        console.log(`✅ Successfully navigated to ${url}`);
        console.log(`📍 New page URL: ${this.page.url()}`);
        console.log(`📄 Page title: ${await this.page.title()}`);
        
        // Return a modified task that works with the loaded page
        const modifiedTask = task.replace(urlPattern, 'interact with the current page');
        console.log(`🔄 Task modified: "${modifiedTask}"`);
        return modifiedTask;
      } catch (error) {
        console.log(`⚠️ Failed to navigate to ${url}, will try AI-based navigation: ${error.message}`);
        return task;
      }
    }
    
    return task;
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
      console.log(`🤖 Executing AI action: "${task}"`);
      console.log(`📍 Page URL at execution: ${this.page.url()}`);
      console.log(`📏 Page content length: ${(await this.page.content()).length} chars`);
      
      const result = await this.agent.aiAction(task);
      
      console.log(`✅ AI action completed successfully`);
      console.log(`📋 Result:`, result);

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
        fullPage: true
        // Note: quality option is only supported for JPEG, not PNG
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
    <title>Automation Report - Playwright</title>
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
            <h1>🎭 Playwright Automation Report</h1>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Framework:</strong> Playwright</p>
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

  async customizeAgentReportBranding() {
    const runDir = process.env.MIDSCENE_RUN_DIR || 'midscene_run';
    const candidateDirs = [
      join(process.cwd(), runDir, 'report'),
      join(process.cwd(), 'backend', runDir, 'report')
    ];
    const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#101010" />
  <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" fill="#00E5A0" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700">DOBB</text>
</svg>
`.trim();
    const faviconDataUri = `data:image/svg+xml;base64,${Buffer.from(svgIcon).toString('base64')}`;
    const brandMarker = 'data-origin="dobb-ai-branding"';
    const brandingScript = `
    <!-- DOBB.ai branding override -->
    <script data-origin="dobb-ai-branding">
      (function() {
        const BRAND = 'DOBB.ai';
        const FAVICON_DATA = '${faviconDataUri}';
        const SHOW_TEXT = (window.NodeFilter && window.NodeFilter.SHOW_TEXT) || 4;
        const FILTER_ACCEPT = (window.NodeFilter && window.NodeFilter.FILTER_ACCEPT) || 1;
        const FILTER_REJECT = (window.NodeFilter && window.NodeFilter.FILTER_REJECT) || 2;
        const FILTER_SKIP = (window.NodeFilter && window.NodeFilter.FILTER_SKIP) || 3;

        const replaceTextNodes = (root) => {
          if (!root) return;
          const walker = document.createTreeWalker(
            root,
            SHOW_TEXT,
            {
              acceptNode(node) {
                const parent = node.parentNode;
                if (!parent) {
                  return FILTER_SKIP;
                }
                const tag = parent.nodeName;
                if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') {
                  return FILTER_REJECT;
                }
                return /Midscene/i.test(node.nodeValue) ? FILTER_ACCEPT : FILTER_SKIP;
              }
            }
          );

          let current;
          while ((current = walker.nextNode())) {
            const updated = current.nodeValue
              .replace(/Midscene\.js/g, BRAND)
              .replace(/Midscene/gi, BRAND);
            if (updated !== current.nodeValue) {
              current.nodeValue = updated;
            }
          }
        };

        const updateLogos = () => {
          const selectors = [
            "img[src*='midscene']",
            "img[alt*='Midscene']",
            "img[alt*='midscene']"
          ];
          selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(img => {
              if (img.dataset.dobbBrandingApplied === 'true') {
                return;
              }
              img.dataset.dobbBrandingApplied = 'true';
              img.alt = BRAND;
              img.src = FAVICON_DATA;
              img.removeAttribute('srcset');
            });
          });
        };

        const updateLinks = () => {
          document.querySelectorAll("a[href*='midscene']").forEach(anchor => {
            if (anchor.dataset.dobbBrandingApplied === 'true') {
              return;
            }
            anchor.dataset.dobbBrandingApplied = 'true';
            anchor.href = 'https://dobb.ai';
            if (anchor.textContent && /Midscene/i.test(anchor.textContent)) {
              anchor.textContent = anchor.textContent.replace(/Midscene/gi, BRAND);
            }
          });
        };

        const updateTitle = () => {
          if (!document.title) {
            return;
          }
          const nextTitle = document.title
            .replace(/Midscene\.js/g, BRAND)
            .replace(/Midscene/gi, BRAND);
          if (nextTitle !== document.title) {
            document.title = nextTitle;
          }
        };

        const ensureFavicon = () => {
          let favicon = document.querySelector("link[rel='icon']");
          if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            if (document.head) {
              document.head.appendChild(favicon);
            }
          }
          if (favicon) {
            favicon.type = 'image/svg+xml';
            favicon.href = FAVICON_DATA;
            favicon.sizes = 'any';
          }
        };

        const applyBranding = () => {
          replaceTextNodes(document.body);
          updateLogos();
          updateLinks();
          updateTitle();
          ensureFavicon();
        };

        const run = () => {
          applyBranding();
          setTimeout(applyBranding, 400);
          setTimeout(applyBranding, 1200);
        };

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', run, { once: true });
        } else {
          run();
        }
      })();
    </script>
    `;

    let updatedFiles = 0;
    const visited = new Set();

    for (const dir of candidateDirs) {
      if (visited.has(dir)) {
        continue;
      }
      visited.add(dir);

      let files;
      try {
        files = await readdir(dir);
      } catch {
        continue;
      }

      for (const fileName of files) {
        if (!fileName.endsWith('.html')) {
          continue;
        }

        const filePath = join(dir, fileName);
        let content;
        try {
          content = await readFile(filePath, 'utf-8');
        } catch {
          continue;
        }

        let modified = false;

        if (content.includes('Report - Midscene.js')) {
          content = content.replace('Report - Midscene.js', 'Report - DOBB.ai');
          modified = true;
        }

        const originalFavicon = 'href="https://lf3-static.bytednsdoc.com/obj/eden-cn/vhaeh7vhabf/favicon-32x32.png"';
        if (content.includes(originalFavicon)) {
          content = content.replace(originalFavicon, `href="${faviconDataUri}"`);
          modified = true;
        }

        if (!content.includes(brandMarker)) {
          if (content.includes('</head>')) {
            content = content.replace('</head>', `${brandingScript}</head>`);
            modified = true;
          } else if (content.includes('</body>')) {
            content = content.replace('</body>', `${brandingScript}</body>`);
            modified = true;
          }
        }

        if (modified) {
          await writeFile(filePath, content, 'utf-8');
          updatedFiles += 1;
        }
      }
    }

    if (updatedFiles > 0) {
      console.log(`🎨 Applied DOBB.ai branding to ${updatedFiles} report${updatedFiles === 1 ? '' : 's'}.`);
    }
  }

  async cleanup() {
    try {
      if (this.browser) {
        await this.browser.close();
        console.log('✅ Playwright browser closed');
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}
