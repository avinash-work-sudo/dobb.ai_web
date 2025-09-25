import express from 'express';
import { readFile, readdir, stat } from 'fs/promises';
import { extname, join } from 'path';
import { TestResultStorage } from '../services/TestResultStorage.js';

const router = express.Router();

// Specific routes must come BEFORE generic routes

// GET /api/artifacts/:executionId/debug
router.get('/:executionId/debug', async (req, res) => {
  try {
    const { executionId } = req.params;
    const artifacts = await TestResultStorage.getExecutionArtifacts(executionId);

    res.json({
      executionId,
      artifactCount: artifacts.length,
      artifacts: artifacts.map(a => ({
        id: a.id,
        type: a.artifact_type,
        path: a.file_path
      })),
      reportArtifact: artifacts.find(a => a.artifact_type === 'html_report') || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/artifacts/:executionId/report
router.get('/:executionId/report', async (req, res) => {
  try {
    const { executionId } = req.params;

    console.log(`🔍 Searching for report artifact for executionId: ${executionId}`);
    const artifacts = await TestResultStorage.getExecutionArtifacts(executionId);
    console.log(`📋 Found ${artifacts.length} artifacts for execution ${executionId}`);
    console.log(`🗂️ Artifact types: ${artifacts.map(a => a.artifact_type).join(', ')}`);

    const reportArtifact = artifacts.find(a => a.artifact_type === 'html_report');
    console.log(`📄 Report artifact found: ${reportArtifact ? 'YES' : 'NO'}`);

    if (!reportArtifact) {
      console.log(
        '❌ No report artifact found. Available artifacts:',
        artifacts.map(a => `${a.artifact_type}@${a.file_path}`)
      );
      return res.status(404).json({
        error: 'HTML report not found',
        executionId,
        availableArtifacts: artifacts.map(a => a.artifact_type)
      });
    }

    const reportContent = await readFile(reportArtifact.file_path, 'utf8');

    res.set({
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600',
      'X-Frame-Options': 'SAMEORIGIN',
      'Content-Security-Policy': "frame-ancestors 'self' http://localhost:* https://localhost:*"
    });

    res.send(reportContent);
  } catch (error) {
    console.error('Error serving report:', error);
    res.status(500).json({
      error: error.message,
      executionId: req.params.executionId
    });
  }
});

// GET /api/artifacts/:executionId/:artifactType
router.get('/:executionId/:artifactType', async (req, res) => {
  try {
    const { executionId, artifactType } = req.params;

    // Get artifact from database
    const artifacts = await TestResultStorage.getExecutionArtifacts(executionId);
    const artifact = artifacts.find(a => a.artifact_type === artifactType);

    if (!artifact) {
      return res.status(404).json({
        error: 'Artifact not found',
        executionId,
        artifactType
      });
    }

    // Check if file exists
    try {
      await stat(artifact.file_path);
    } catch (error) {
      return res.status(404).json({
        error: 'Artifact file not found on disk',
        executionId,
        artifactType,
        filePath: artifact.file_path
      });
    }

    // Read and serve file
    const fileContent = await readFile(artifact.file_path);
    const extension = extname(artifact.file_path);

    // Set appropriate headers
    const headers = {
      'Content-Type': artifact.mime_type || getMimeType(extension),
      'Content-Length': fileContent.length,
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Content-Disposition': `inline; filename="${artifactType}${extension}"`
    };

    // Add frame options for HTML content
    if (extension === '.html' || artifact.mime_type === 'text/html') {
      headers['X-Frame-Options'] = 'SAMEORIGIN';
      headers['Content-Security-Policy'] =
        "frame-ancestors 'self' http://localhost:* https://localhost:*";
    }

    res.set(headers);

    res.send(fileContent);
  } catch (error) {
    console.error('Error serving artifact:', error);
    res.status(500).json({
      error: error.message,
      executionId: req.params.executionId,
      artifactType: req.params.artifactType
    });
  }
});

// GET /api/artifacts/:executionId/:artifactType/download
router.get('/:executionId/:artifactType/download', async (req, res) => {
  try {
    const { executionId, artifactType } = req.params;

    const artifacts = await TestResultStorage.getExecutionArtifacts(executionId);
    const artifact = artifacts.find(a => a.artifact_type === artifactType);

    if (!artifact) {
      return res.status(404).json({
        error: 'Artifact not found',
        executionId,
        artifactType
      });
    }

    const fileContent = await readFile(artifact.file_path);
    const extension = extname(artifact.file_path);

    // Force download
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${artifactType}_${executionId}${extension}"`,
      'Content-Length': fileContent.length
    });

    res.send(fileContent);
  } catch (error) {
    console.error('Error downloading artifact:', error);
    res.status(500).json({
      error: error.message,
      executionId: req.params.executionId,
      artifactType: req.params.artifactType
    });
  }
});

// GET /api/artifacts/:executionId/debug
router.get('/:executionId/debug', async (req, res) => {
  try {
    const { executionId } = req.params;
    const artifacts = await TestResultStorage.getExecutionArtifacts(executionId);

    res.json({
      executionId,
      artifactCount: artifacts.length,
      artifacts: artifacts.map(a => ({
        id: a.id,
        type: a.artifact_type,
        path: a.file_path
      })),
      reportArtifact: artifacts.find(a => a.artifact_type === 'html_report') || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/artifacts/:executionId/report
router.get('/:executionId/report', async (req, res) => {
  try {
    const { executionId } = req.params;

    console.log(`🔍 Searching for report artifact for executionId: ${executionId}`);
    // const artifacts = await TestResultStorage.getExecutionArtifacts(executionId);
    // console.log(`📋 Found ${artifacts.length} artifacts for execution ${executionId}`);
    // console.log(`🗂️ Artifact types: ${artifacts.map(a => a.artifact_type).join(', ')}`);

    // const reportArtifact = artifacts.find(a => a.artifact_type === 'html_report');
    // console.log(`📄 Report artifact found: ${reportArtifact ? 'YES' : 'NO'}`);
    // get file from backend/artifacts/reports/report_${executionId}.html
    const reportPath = join(process.env.ARTIFACTS_PATH, 'reports', `report_${executionId}.html`);
    console.log(`📄 Report path: ${reportPath}`);
    const reportContentLocal = await readFile(reportPath, 'utf8');

    // if (!reportArtifact) {
    //   console.log(`❌ No report artifact found. Available artifacts:`, artifacts.map(a => `${a.artifact_type}@${a.file_path}`));
    //   return res.status(404).json({
    //     error: 'HTML report not found',
    //     executionId,
    //     availableArtifacts: artifacts.map(a => a.artifact_type)
    //   });
    // }

    // const reportContent = await readFile(reportArtifact.file_path, 'utf8');

    res.set({
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600',
      'X-Frame-Options': 'SAMEORIGIN',
      'Content-Security-Policy': "frame-ancestors 'self' http://localhost:* https://localhost:*"
    });

    res.send(reportContentLocal);
  } catch (error) {
    console.error('Error serving report:', error);
    res.status(500).json({
      error: error.message,
      executionId: req.params.executionId
    });
  }
});

// GET /api/artifacts/:executionId/playwright-report
router.get('/:executionId/playwright-report', async (req, res) => {
  try {
    const { executionId } = req.params;

    console.log(`🎭 Searching for Playwright report for executionId: ${executionId}`);

    // Construct path to playwright report in midscene_run directory
    const midsceneDir = process.env.MIDSCENE_RUN_DIR || 'midscene_run';
    const playwrightReportPath = join(
      process.cwd(),
      midsceneDir,
      'report',
      `playwright-report_${executionId}.html`
    );

    console.log(`📄 Playwright report path: ${playwrightReportPath}`);

    try {
      const playwrightReportContent = await readFile(playwrightReportPath, 'utf8');

      res.set({
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-ancestors 'self' http://localhost:* https://localhost:*"
      });

      res.send(playwrightReportContent);
    } catch (fileError) {
      console.warn(`❌ Playwright report file not found at ${playwrightReportPath}`);

      // Try to find any playwright report files in the directory
      try {
        const reportDir = join(process.cwd(), midsceneDir, 'report');
        const files = await readdir(reportDir);
        const playwrightFiles = files.filter(
          file => file.startsWith('playwright') && file.endsWith('.html')
        );

        console.log(`📁 Available Playwright files: ${playwrightFiles.join(', ')}`);

        return res.status(404).json({
          error: 'Playwright report not found',
          executionId,
          expectedPath: playwrightReportPath,
          availableFiles: playwrightFiles,
          suggestion:
            playwrightFiles.length > 0
              ? 'Playwright report may have been generated with datetime naming. Check available files.'
              : 'No Playwright reports found in directory.'
        });
      } catch (dirError) {
        return res.status(404).json({
          error: 'Playwright report directory not accessible',
          executionId,
          path: playwrightReportPath,
          details: dirError.message
        });
      }
    }
  } catch (error) {
    console.error('Error serving Playwright report:', error);
    res.status(500).json({
      error: error.message,
      executionId: req.params.executionId
    });
  }
});

// GET /api/artifacts/:executionId/screenshots
router.get('/:executionId/screenshots', async (req, res) => {
  try {
    const { executionId } = req.params;

    const artifacts = await TestResultStorage.getExecutionArtifacts(executionId);
    const screenshots = artifacts.filter(a => a.artifact_type === 'screenshot');

    const screenshotList = screenshots.map(screenshot => ({
      id: screenshot.id,
      description: screenshot.description,
      url: `/api/artifacts/${executionId}/screenshot/${screenshot.id}`,
      downloadUrl: `/api/artifacts/${executionId}/screenshot/${screenshot.id}/download`,
      createdAt: screenshot.created_at
    }));

    res.json({
      success: true,
      screenshots: screenshotList,
      count: screenshotList.length,
      executionId
    });
  } catch (error) {
    console.error('Error listing screenshots:', error);
    res.status(500).json({
      error: error.message,
      executionId: req.params.executionId
    });
  }
});

// GET /api/artifacts/:executionId/screenshot/:screenshotId
router.get('/:executionId/screenshot/:screenshotId', async (req, res) => {
  try {
    const { executionId, screenshotId } = req.params;

    const artifacts = await TestResultStorage.getExecutionArtifacts(executionId);
    const screenshot = artifacts.find(
      a => a.id === screenshotId && a.artifact_type === 'screenshot'
    );

    if (!screenshot) {
      return res.status(404).json({
        error: 'Screenshot not found',
        executionId,
        screenshotId
      });
    }

    const imageContent = await readFile(screenshot.file_path);

    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'Content-Length': imageContent.length
    });

    res.send(imageContent);
  } catch (error) {
    console.error('Error serving screenshot:', error);
    res.status(500).json({
      error: error.message,
      executionId: req.params.executionId,
      screenshotId: req.params.screenshotId
    });
  }
});

// Helper function to get MIME type from file extension
function getMimeType(extension) {
  const mimeTypes = {
    '.html': 'text/html',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.json': 'application/json',
    '.txt': 'text/plain',
    '.log': 'text/plain',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm'
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

export default router;
