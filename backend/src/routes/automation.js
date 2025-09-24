import express from 'express';
import { PlaywrightAutomationService } from '../services/PlaywrightAutomationService.js';
import { PuppeteerAutomationService } from '../services/PuppeteerAutomationService.js';
import { TestResultStorage } from '../services/TestResultStorage.js';
import { broadcastAutomationUpdate } from '../server.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// POST /api/automation/run
router.post('/run', async (req, res) => {
  const executionId = uuidv4();
  
  try {
    const { 
      task, 
      framework = 'playwright', 
      options = {},
      requirements = [] 
    } = req.body;

    // Validate input
    if (!task || typeof task !== 'string') {
      return res.status(400).json({
        error: 'Task description is required and must be a string',
        executionId
      });
    }

    if (!['playwright', 'puppeteer'].includes(framework)) {
      return res.status(400).json({
        error: 'Framework must be either "playwright" or "puppeteer"',
        executionId
      });
    }

    // Create initial execution record
    await TestResultStorage.createExecution({
      id: executionId,
      testName: `Automation: ${task.substring(0, 50)}${task.length > 50 ? '...' : ''}`,
      taskDescription: task,
      framework,
      status: 'running',
      startedAt: new Date(),
      browserInfo: JSON.stringify(options)
    });

    // Broadcast start event
    broadcastAutomationUpdate(executionId, {
      status: 'started',
      task,
      framework,
      timestamp: new Date().toISOString()
    });

    // Return immediately with execution ID
    res.json({
      success: true,
      executionId,
      status: 'started',
      framework,
      task,
      message: 'Automation started. Use WebSocket or polling to get updates.',
      statusUrl: `/api/automation/status/${executionId}`
    });

    // Run automation asynchronously
    runAutomationAsync(executionId, task, framework, options, requirements);

  } catch (error) {
    console.error('Error starting automation:', error);
    
    await TestResultStorage.updateExecution(executionId, {
      status: 'error',
      completedAt: new Date(),
      errorMessage: error.message
    });

    broadcastAutomationUpdate(executionId, {
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      success: false,
      executionId,
      error: error.message
    });
  }
});

// GET /api/automation/status/:executionId
router.get('/status/:executionId', async (req, res) => {
  try {
    const { executionId } = req.params;
    
    const execution = await TestResultStorage.getExecution(executionId);
    if (!execution) {
      return res.status(404).json({
        error: 'Execution not found',
        executionId
      });
    }

    const steps = await TestResultStorage.getExecutionSteps(executionId);
    const artifacts = await TestResultStorage.getExecutionArtifacts(executionId);

    res.json({
      success: true,
      execution,
      steps,
      artifacts,
      isComplete: ['passed', 'failed', 'error'].includes(execution.status)
    });

  } catch (error) {
    console.error('Error getting automation status:', error);
    res.status(500).json({
      error: error.message,
      executionId: req.params.executionId
    });
  }
});

// POST /api/automation/stop/:executionId
router.post('/stop/:executionId', async (req, res) => {
  try {
    const { executionId } = req.params;
    
    // Update execution status
    await TestResultStorage.updateExecution(executionId, {
      status: 'stopped',
      completedAt: new Date(),
      errorMessage: 'Stopped by user'
    });

    broadcastAutomationUpdate(executionId, {
      status: 'stopped',
      message: 'Automation stopped by user',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      executionId,
      status: 'stopped',
      message: 'Automation stopped successfully'
    });

  } catch (error) {
    console.error('Error stopping automation:', error);
    res.status(500).json({
      error: error.message,
      executionId: req.params.executionId
    });
  }
});

// GET /api/automation/frameworks
router.get('/frameworks', (req, res) => {
  res.json({
    frameworks: [
      {
        name: 'playwright',
        displayName: 'Playwright',
        description: 'Multi-browser support (Chrome, Firefox, Safari, Edge)',
        features: ['Multi-browser', 'Mobile testing', 'Network interception', 'Auto-wait'],
        recommended: true
      },
      {
        name: 'puppeteer',
        displayName: 'Puppeteer', 
        description: 'Chrome/Chromium focused with DevTools integration',
        features: ['Chrome DevTools', 'PDF generation', 'Performance profiling', 'Lightweight'],
        recommended: false
      }
    ],
    defaultOptions: {
      headless: false,
      viewport: { width: 1280, height: 720 },
      timeout: 30000,
      slowMo: 100
    }
  });
});

// Async function to run automation
async function runAutomationAsync(executionId, task, framework, options, requirements) {
  const startTime = Date.now();
  
  try {
    // Choose automation service
    const AutomationService = framework === 'playwright' 
      ? PlaywrightAutomationService 
      : PuppeteerAutomationService;
    
    const service = new AutomationService();
    
    // Set up progress callback
    service.onProgress = (update) => {
      broadcastAutomationUpdate(executionId, {
        status: 'progress',
        ...update,
        timestamp: new Date().toISOString()
      });
    };

    // Initialize and run
    await service.initialize(options);
    const result = await service.runTask(task);
    
    const duration = Date.now() - startTime;
    
    // Store results
    await TestResultStorage.updateExecution(executionId, {
      status: result.success ? 'passed' : 'failed',
      completedAt: new Date(),
      durationMs: duration,
      errorMessage: result.error
    });

    // Store steps
    if (result.steps) {
      for (const step of result.steps) {
        await TestResultStorage.addStep(executionId, step);
      }
    }

    // Store artifacts
    if (result.artifacts) {
      for (const artifact of result.artifacts) {
        await TestResultStorage.addArtifact(executionId, artifact);
      }
    }

    // Store requirements mapping
    for (const requirement of requirements) {
      await TestResultStorage.addRequirement(executionId, requirement);
    }

    // Broadcast completion
    broadcastAutomationUpdate(executionId, {
      status: result.success ? 'completed' : 'failed',
      duration,
      error: result.error,
      reportUrl: result.reportUrl,
      timestamp: new Date().toISOString()
    });

    await service.cleanup();

  } catch (error) {
    console.error('Automation execution error:', error);
    
    const duration = Date.now() - startTime;
    
    await TestResultStorage.updateExecution(executionId, {
      status: 'error',
      completedAt: new Date(),
      durationMs: duration,
      errorMessage: error.message
    });

    broadcastAutomationUpdate(executionId, {
      status: 'error',
      duration,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

export default router;

