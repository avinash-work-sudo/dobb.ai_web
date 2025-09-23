import express from 'express';
import { readFile, stat } from 'fs/promises';
import { join, extname } from 'path';
import { TestResultStorage } from '../services/TestResultStorage.js';

const router = express.Router();

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
    res.set({
      'Content-Type': artifact.mime_type || getMimeType(extension),
      'Content-Length': fileContent.length,
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Content-Disposition': `inline; filename="${artifactType}${extension}"`
    });

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

// GET /api/artifacts/:executionId/report
router.get('/:executionId/report', async (req, res) => {
  try {
    const { executionId } = req.params;
    
    const artifacts = await TestResultStorage.getExecutionArtifacts(executionId);
    const reportArtifact = artifacts.find(a => a.artifact_type === 'html_report');

    if (!reportArtifact) {
      return res.status(404).json({
        error: 'HTML report not found',
        executionId
      });
    }

    const reportContent = await readFile(reportArtifact.file_path, 'utf8');
    
    res.set({
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600'
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
    const screenshot = artifacts.find(a => a.id === screenshotId && a.artifact_type === 'screenshot');

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
