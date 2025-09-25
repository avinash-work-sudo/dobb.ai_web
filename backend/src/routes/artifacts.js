import express from 'express';
import { readFile, stat } from 'fs/promises';
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
router.get('/:executionId/report/:reportType', async (req, res) => {
  try {
    const { executionId, reportType } = req.params;
    let reportPath = null;
    if (reportType === 'playwright') {
      reportPath = join(
        process.env.MIDSCENE_RUN_DIR || './midscene_run',
        'report',
        `playwright-report_${executionId}.html`
      );
    } else {
      reportPath = join(
        process.env.ARTIFACTS_PATH || './artifacts',
        'reports',
        `report_${executionId}.html`
      );
    }

    console.log(`🔍 Searching for report artifact for executionId: ${executionId}`);
    console.log(`📄 Report path: ${reportPath}`);
    const reportContentLocal = await readFile(reportPath, 'utf8');

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
    // const { executionId } = req.params;
    // console.log(`🎭 Searching for Playwright report for executionId: ${executionId}`);
    // // const midsceneDir = process.env.MIDSCENE_RUN_DIR || 'midscene_run';
    // // const candidateDirs = [
    // //   join(process.cwd(), midsceneDir, 'report'),
    // //   join(process.cwd(), 'backend', midsceneDir, 'report')
    // // ];
    // const reportPath = join(
    //   process.env.MIDSCENE_RUN_DIR,
    //   'report',
    //   `playwright-report_${executionId}.html`
    // );
    // const visited = new Set();
    // let resolvedPath = null;
    // let reportContent = null;
    // for (const rawDir of candidateDirs) {
    //   const dir = join(rawDir); // normalise
    //   if (visited.has(dir)) {
    //     continue;
    //   }
    //   visited.add(dir);
    //   const candidatePath = join(dir, `playwright-report_${executionId}.html`);
    //   console.log(`📄 Checking Playwright report path: ${candidatePath}`);
    //   try {
    //     reportContent = await readFile(candidatePath, 'utf8');
    //     resolvedPath = candidatePath;
    //     break;
    //   } catch (fileError) {
    //     console.warn(`❌ Playwright report file not found at ${candidatePath}`);
    //   }
    // }
    // if (reportContent) {
    //   res.set({
    //     'Content-Type': 'text/html',
    //     'Cache-Control': 'public, max-age=3600',
    //     'X-Frame-Options': 'SAMEORIGIN',
    //     'Content-Security-Policy': "frame-ancestors 'self' http://localhost:* https://localhost:*"
    //   });
    //   console.log(`✅ Serving Playwright report from ${resolvedPath}`);
    //   return res.send(reportContent);
    // }
    // const allFiles = new Set();
    // for (const rawDir of visited) {
    //   try {
    //     const files = await readdir(rawDir);
    //     files
    //       .filter(file => file.startsWith('playwright') && file.endsWith('.html'))
    //       .forEach(file => allFiles.add(join(rawDir, file)));
    //   } catch (dirError) {
    //     console.warn(`⚠️ Unable to list directory ${rawDir}: ${dirError.message}`);
    //   }
    // }
    // return res.status(404).json({
    //   error: 'Playwright report not found',
    //   executionId,
    //   searchedPaths: Array.from(visited).map(dir =>
    //     join(dir, `playwright-report_${executionId}.html`)
    //   ),
    //   availableFiles: Array.from(allFiles),
    //   suggestion:
    //     allFiles.size > 0
    //       ? 'Playwright report may have been generated with a different naming convention. Check available files.'
    //       : 'No Playwright reports found in searched directories.'
    // });

    const { executionId } = req.params;

    console.log(`🔍 Searching for report artifact for executionId: ${executionId}`);
    const reportPath = join(
      process.env.MIDSCENE_RUN_DIR || './midscene_run',
      'report',
      `playwright-report_${executionId}.html`
    );
    console.log(`📄 Report path: ${reportPath}`);
    const reportContentLocal = await readFile(reportPath, 'utf8');

    res.set({
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600',
      'X-Frame-Options': 'SAMEORIGIN',
      'Content-Security-Policy': "frame-ancestors 'self' http://localhost:* https://localhost:*"
    });

    res.send(reportContentLocal);
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
